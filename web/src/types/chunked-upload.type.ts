/**
 * Type definitions for chunked upload API v2
 */

// === Request Types ===

export interface InitUploadRequest {
  chapterId: string
  title: string
  content?: string
  fileName: string
  contentType: string
  fileSize: number
  duration?: number
  position?: number
  isPublic?: boolean
  chunkSize?: number
}

export interface PresignRequest {
  partNumbers: number[]
}

export interface UploadPartRequest {
  partNumber: number
  etag: string
}

export interface CompleteUploadRequest {
  parts: UploadPartRequest[]
  title?: string
  content?: string
  duration?: number
  position?: number
  isPublic?: boolean
  fileType: 'video' | 'article'
}

// === Response Types ===

export interface InitUploadResponse {
  sessionId: string
  uploadId: string
  objectKey: string
  chunkSize: number
  totalParts: number
  expiresAt: number // epoch milliseconds
  fileUrl: string
}

export interface PresignedPart {
  partNumber: number
  url: string
  expiresAt: number // epoch milliseconds
}

export interface PresignResponse {
  sessionId: string
  parts: PresignedPart[]
}

export interface SessionResponse {
  sessionId: string
  chapterId: string
  status: 'PENDING' | 'UPLOADING' | 'COMPLETED' | 'ABORTED' | 'EXPIRED'
  chunkSize: number
  totalParts: number
  expiresAt: number // epoch milliseconds
  fileUrl?: string
  fileType?: 'video' | 'article'
}

export interface CompleteUploadResponse {
  id: string
  title: string
  content: string
  duration: number
  position: number
  isPublic: boolean
  type: 'video' | 'article'
  url: string
}
