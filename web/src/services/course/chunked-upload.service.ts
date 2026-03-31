/**
 * Chunked Upload Service
 * Handles all API calls for the new v2 chunked upload flow with presigned URLs
 */

import axiosClient from '@/lib/axiosClient.lib'
import axiosS3Client from '@/lib/axiosS3Client.lib'
import axiosAuthUtils from '@/utils/auth/axios.utils'
import { ApiResponse } from '@/types/response.type'
import {
  InitUploadRequest,
  InitUploadResponse,
  PresignResponse,
  SessionResponse,
  CompleteUploadRequest,
  CompleteUploadResponse
} from '@/types/chunked-upload.type'

// Re-export types for convenience
export type {
  InitUploadRequest,
  InitUploadResponse,
  PresignResponse,
  SessionResponse,
  CompleteUploadRequest,
  CompleteUploadResponse
}

// === Main Service ===

class ChunkedUploadService {
  private baseUrl = 'learning/lessons/video/v2'

  /**
   * Step 1: Initialize an upload session
   */
  async initUpload(request: InitUploadRequest): Promise<ApiResponse<InitUploadResponse>> {
    const response = await axiosClient.axiosInstance.post(`${this.baseUrl}/sessions`, request)
    return response.data
  }

  /**
   * Step 2: Get presigned URLs for uploading chunks
   */
  async getPresignedUrls(
    sessionId: string,
    partNumbers: number[]
  ): Promise<ApiResponse<PresignResponse>> {
    const response = await axiosClient.axiosInstance.post(
      `${this.baseUrl}/sessions/${sessionId}/presign`,
      { partNumbers }
    )
    return response.data
  }

  /**
   * Step 3: Upload a chunk directly to S3 using presigned URL
   * Returns ETag from S3 response header
   * NOTE: Do NOT include Authorization header - presigned URL has auth in query params
   */
  async uploadChunkToS3(presignedUrl: string, chunk: Blob): Promise<string> {
    const response = await axiosS3Client.axiosInstance.put(presignedUrl, chunk, {
      headers: {
        'Content-Type': 'application/octet-stream'
      }
    })

    // Extract ETag from response headers
    const etag = response.headers['etag'] || response.headers.etag
    if (!etag) {
      throw new Error('Failed to retrieve ETag from S3 response')
    }

    return etag
  }

  /**
   * Step 4: Complete the multipart upload (JSON response)
   * Returns the created lesson data
   */
  async completeUpload(
    sessionId: string,
    request: CompleteUploadRequest
  ): Promise<CompleteUploadResponse> {
    const response = await axiosClient.axiosInstance.post<ApiResponse<CompleteUploadResponse>>(
      `${this.baseUrl}/sessions/${sessionId}/complete`,
      request
    )
    
    if (!response.data.result) {
      throw new Error(response.data.message || 'Failed to complete upload')
    }
    
    return response.data.result
  }

  /**
   * Step 5: Get current session status (for resume)
   */
  async getSession(sessionId: string): Promise<ApiResponse<SessionResponse>> {
    const response = await axiosClient.axiosInstance.get(
      `${this.baseUrl}/sessions/${sessionId}`
    )
    return response.data
  }

  /**
   * Step 6: Abort an upload session
   */
  async abortUpload(sessionId: string): Promise<ApiResponse<void>> {
    const response = await axiosClient.axiosInstance.delete(
      `${this.baseUrl}/sessions/${sessionId}`
    )
    return response.data
  }

  /**
   * Convenience method to upload a chunk with retry logic
   */
  async uploadChunkWithRetry(
    presignedUrl: string,
    chunk: Blob,
    maxRetries: number = 3
  ): Promise<string> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await this.uploadChunkToS3(presignedUrl, chunk)
      } catch (error) {
        lastError = error as Error
        // Exponential backoff: 1s, 2s, 4s
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error('Upload failed after retries')
  }

  /**
   * Check if a presigned URL is about to expire (within 30 seconds)
   */
  isPresignedUrlExpiringSoon(expiresAt: number, buffer: number = 30000): boolean {
    const timeUntilExpiry = expiresAt - Date.now()
    return timeUntilExpiry < buffer
  }
}

export default new ChunkedUploadService()
