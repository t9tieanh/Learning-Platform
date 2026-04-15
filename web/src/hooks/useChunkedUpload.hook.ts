/**
 * Hook for managing chunked video/article upload lifecycle (multi-file)
 * Handles: initialization, chunking, presign requests, S3 uploads, and JSON completion
 * Compatible with UploadProgress component for displaying multiple file uploads
 */

import { useState, useCallback, useRef } from 'react'
import { toast } from 'sonner'
import chunkedUploadService from '@/services/course/chunked-upload.service'
import {
  splitFileIntoChunks,
  batchPartNumbers,
  calculateProgress,
  FileChunk
} from '@/utils/upload/file-chunking.util'
import { InitUploadRequest, CompleteUploadResponse } from '@/types/chunked-upload.type'
import { MultiUploadItem } from '@/hooks/useMultiUpload'

const ERROR_CODES = {
  SESSION_NOT_FOUND: 'LESSON_UPLOAD_SESSION_NOT_FOUND',
  SESSION_EXPIRED: 'LESSON_UPLOAD_SESSION_EXPIRED',
  INVALID_PART: 'LESSON_UPLOAD_INVALID_PART',
  INVALID_STATE: 'LESSON_UPLOAD_INVALID_STATE',
  TOO_MANY_PARTS: 'LESSON_UPLOAD_TOO_MANY_PARTS'
}

const ERROR_MESSAGES: Record<string, string> = {
  [ERROR_CODES.SESSION_NOT_FOUND]: 'Session không được tìm thấy. Vui lòng bắt đầu upload mới.',
  [ERROR_CODES.SESSION_EXPIRED]:
    'Phiên upload đã hết hạn. Vui lòng bắt đầu upload mới.',
  [ERROR_CODES.INVALID_PART]: 'Một số chunks bị lỗi. Vui lòng upload lại.',
  [ERROR_CODES.INVALID_STATE]: 'Trạng thái upload không hợp lệ. Vui lòng làm mới.',
  [ERROR_CODES.TOO_MANY_PARTS]:
    'File quá lớn với kích thước chunk này. Vui lòng tăng kích thước chunk.'
}

/**
 * Extract error code and message from API response or error
 */
function extractErrorMessage(error: any): string {
  // Check API error response
  if (error?.response?.data?.code) {
    const code = error.response.data.code
    return ERROR_MESSAGES[code] || error.response.data.message || 'Upload thất bại'
  }

  // Check error message
  if (error?.message) {
    // Check if error message contains known error code
    for (const [code, msg] of Object.entries(ERROR_MESSAGES)) {
      if (error.message.includes(code)) {
        return msg
      }
    }
    return error.message
  }

  return 'Có lỗi xảy ra. Vui lòng thử lại.'
}

/**
 * Internal session data per upload
 */
interface SessionData {
  sessionId: string | null
  fileName: string
  totalSize: number
  uploadedSize: number
  chunks: FileChunk[]
  uploadedEtags: Map<number, string>
  abortController: AbortController | null
  lessonData: CompleteUploadResponse | null
}

export function useChunkedUpload() {
  const [uploads, setUploads] = useState<MultiUploadItem[]>([])
  const sessionsRef = useRef<Map<string, SessionData>>(new Map())

  /**
   * Upsert an upload item in the uploads array
   */
  const upsert = useCallback((id: string, patch: Partial<MultiUploadItem>) => {
    setUploads((prev) => {
      const idx = prev.findIndex((p) => p.id === id)
      if (idx === -1) {
        const item: MultiUploadItem = {
          id,
          fileName: patch.fileName ?? 'unknown',
          progress: patch.progress ?? 0,
          message: patch.message ?? '',
          status: patch.status ?? 'idle',
          title: patch.title ?? ''
        }
        return [item, ...prev]
      }
      const next = [...prev]
      next[idx] = { ...next[idx], ...patch }
      return next
    })
  }, [])

  /**
   * Initialize upload: split file, init session, prepare chunks
   * Returns upload ID for tracking
   */
  const startUpload = useCallback(
    async (
      file: File,
      initRequest: Omit<InitUploadRequest, 'fileSize' | 'fileName' | 'contentType'>
    ) => {
      const uploadId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

      try {
        // Create upload item
        upsert(uploadId, {
          id: uploadId,
          fileName: file.name,
          progress: 0,
          message: 'Đang chuẩn bị tệp...',
          status: 'uploading',
          title: initRequest.title || file.name
        })

        // Step 1: Split file into chunks
        const chunkingResult = await splitFileIntoChunks(file, initRequest.chunkSize)

        upsert(uploadId, {
          progress: 10,
          message: 'Đang tải lên chunks...'
        })

        // Step 2: Initialize session
        const initResponse = await chunkedUploadService.initUpload({
          ...initRequest,
          fileSize: file.size,
          fileName: file.name,
          contentType: file.type,
          chunkSize: chunkingResult.chunkSize
        })

        if (!initResponse.result) {
          throw new Error(initResponse.message || 'Failed to initialize upload')
        }

        const sessionData = initResponse.result!

        // Store session data
        sessionsRef.current.set(uploadId, {
          sessionId: sessionData.sessionId,
          fileName: file.name,
          totalSize: file.size,
          uploadedSize: 0,
          chunks: chunkingResult.chunks,
          uploadedEtags: new Map(),
          abortController: null,
          lessonData: null
        })

        return uploadId
      } catch (error) {
        const errorMsg = extractErrorMessage(error)
        upsert(uploadId, {
          status: 'error',
          message: errorMsg,
          progress: 0
        })
        toast.error(errorMsg)
        throw error
      }
    },
    [upsert]
  )

  /**
   * Upload all chunks for a specific upload session
   * Returns the Map of part numbers to ETags for use in completeUpload
   */
  const uploadChunks = useCallback(
    async (uploadId: string): Promise<Map<number, string>> => {
      const session = sessionsRef.current.get(uploadId)
      if (!session || !session.sessionId) {
        throw new Error('Upload session not found')
      }

      const { sessionId, chunks, totalSize } = session

      if (!sessionId || chunks.length === 0) {
        throw new Error('Invalid session or no chunks to upload')
      }

      try {
        const abortController = new AbortController()
        session.abortController = abortController

        const etags = new Map<number, string>()
        let uploadedSize = 0

        // Batch presign requests (max 1000 per request)
        const partNumbers = chunks.map((c) => c.partNumber)
        const batches = batchPartNumbers(partNumbers, 1000)

        // Upload chunks in batches
        for (const batch of batches) {
          if (abortController.signal.aborted) {
            throw new Error('Upload cancelled')
          }

          // Get presigned URLs for this batch
          const presignResponse = await chunkedUploadService.getPresignedUrls(sessionId, batch)

          if (!presignResponse.result) {
            throw new Error(presignResponse.message || 'Failed to get presigned URLs')
          }

          // Upload chunks in parallel (but with concurrency limit to avoid overwhelming network)
          const presignedParts = presignResponse.result!.parts
          const concurrency = 3

          for (let i = 0; i < presignedParts.length; i += concurrency) {
            if (abortController.signal.aborted) {
              throw new Error('Upload cancelled')
            }

            const batchToUpload = presignedParts.slice(i, i + concurrency)
            const uploadPromises = batchToUpload.map(async (presignedPart) => {
              const chunk = chunks.find((c) => c.partNumber === presignedPart.partNumber)
              if (!chunk) return

              // Check if presigned URL is about to expire
              if (chunkedUploadService.isPresignedUrlExpiringSoon(presignedPart.expiresAt)) {
                throw new Error(`Presigned URL expired for part ${presignedPart.partNumber}`)
              }

              // Upload chunk with retry
              const etag = await chunkedUploadService.uploadChunkWithRetry(
                presignedPart.url,
                chunk.data,
                3
              )

              etags.set(chunk.partNumber, etag)
              uploadedSize += chunk.size

              // Update progress
              const progress = 10 + calculateProgress(uploadedSize, totalSize) * 0.8 // 10-90%
              upsert(uploadId, {
                progress: Math.round(progress),
                message: `Tải lên ${Math.round((uploadedSize / totalSize) * 100)}%`
              })
            })

            await Promise.all(uploadPromises)
          }
        }

        session.uploadedEtags = etags
        session.uploadedSize = totalSize

        upsert(uploadId, {
          progress: 90,
          message: 'Hoàn tất chunks, đang xác nhận...'
        })

        // Return etags for immediate use in completeUpload
        return etags
      } catch (error) {
        const errorMsg = extractErrorMessage(error)
        
        // Auto-abort session on error
        const session = sessionsRef.current.get(uploadId)
        if (session && session.sessionId) {
          try {
            await chunkedUploadService.abortUpload(session.sessionId)
          } catch (abortErr) {
            console.error('Failed to abort session:', abortErr)
          }
        }
        
        upsert(uploadId, {
          status: 'error',
          message: errorMsg,
          progress: 0
        })
        toast.error(errorMsg)
        throw error
      }
    },
    [upsert]
  )

  /**
   * Complete upload via JSON response (v2 API)
   * Requires fileType parameter to specify 'video' or 'article'
   */
  const completeUpload = useCallback(
    async (
      uploadId: string,
      fileType: 'video' | 'article',
      title?: string,
      content?: string,
      duration?: number,
      position?: number,
      isPublic?: boolean
    ): Promise<CompleteUploadResponse> => {
      const session = sessionsRef.current.get(uploadId)
      if (!session || !session.sessionId) {
        throw new Error('Upload session not found')
      }

      const { sessionId, uploadedEtags } = session

      if (!sessionId || uploadedEtags.size === 0) {
        throw new Error('Invalid session or no chunks uploaded')
      }

      try {
        upsert(uploadId, {
          progress: 95,
          message: 'Đang hoàn tất upload...'
        })

        // Prepare parts in ascending order
        const parts = Array.from(uploadedEtags.entries())
          .sort(([a], [b]) => a - b)
          .map(([partNumber, etag]) => ({
            partNumber,
            etag // etag is already quoted from S3
          }))

        // Complete upload with JSON response
        const response = await chunkedUploadService.completeUpload(sessionId, {
          parts,
          title,
          content,
          duration,
          position,
          isPublic,
          fileType
        })

        session.lessonData = response

        upsert(uploadId, {
          progress: 100,
          status: 'done',
          message: 'Hoàn tất'
        })

        return response
      } catch (error) {
        const errorMsg = extractErrorMessage(error)
        
        // Auto-abort session on error
        if (sessionId) {
          try {
            await chunkedUploadService.abortUpload(sessionId)
          } catch (abortErr) {
            console.error('Failed to abort session:', abortErr)
          }
        }
        
        upsert(uploadId, {
          status: 'error',
          message: errorMsg,
          progress: 0
        })
        toast.error(errorMsg)
        throw error
      }
    },
    [upsert]
  )

  /**
   * Cancel a specific upload with API call to abort session
   */
  const cancelUpload = useCallback((uploadId: string) => {
    const session = sessionsRef.current.get(uploadId)
    if (session && session.sessionId) {
      // Call abort API
      chunkedUploadService.abortUpload(session.sessionId).catch((err) => {
        console.error('Failed to abort session:', err)
      })
    }
    if (session && session.abortController) {
      session.abortController.abort()
    }
    upsert(uploadId, {
      status: 'cancelled',
      message: 'Cancelled by user',
      progress: 0
    })
  }, [upsert])

  /**
   * Remove upload from the list
   */
  const removeUpload = useCallback((uploadId: string) => {
    sessionsRef.current.delete(uploadId)
    setUploads((prev) => prev.filter((p) => p.id !== uploadId))
  }, [])

  /**
   * Clear all uploads
   */
  const clearAll = useCallback(() => {
    sessionsRef.current.forEach((session) => {
      if (session.abortController) {
        session.abortController.abort()
      }
    })
    sessionsRef.current.clear()
    setUploads([])
  }, [])

  /**
   * Update upload data (for storing metadata like chapterId, title, etc)
   */
  const updateUploadData = useCallback((uploadId: string, data: any) => {
    setUploads((prev) =>
      prev.map((item) =>
        item.id === uploadId
          ? { ...item, data: { ...item.data, ...data } }
          : item
      )
    )
  }, [])

  return {
    uploads,
    startUpload,
    uploadChunks,
    completeUpload,
    cancelUpload,
    removeUpload,
    clearAll,
    updateUploadData
  }
}
