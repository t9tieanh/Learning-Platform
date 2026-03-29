/**
 * File chunking utility for splitting large files into manageable chunks
 * Supports resume capability through file metadata
 */

export interface FileChunk {
  partNumber: number
  data: Blob
  size: number
  hash?: string
}

export interface ChunkingConfig {
  chunkSize: number // in bytes (default 10MB)
  totalSize: number
  fileName: string
  contentType: string
}

export interface ChunkingResult {
  chunks: FileChunk[]
  totalParts: number
  totalSize: number
  chunkSize: number
}

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Validates chunk size (5MB - 50MB range as per backend spec)
 */
export function validateChunkSize(size: number): number {
  const MIN_CHUNK = 5 * 1024 * 1024 // 5MB
  const MAX_CHUNK = 50 * 1024 * 1024 // 50MB

  if (size < MIN_CHUNK) return MIN_CHUNK
  if (size > MAX_CHUNK) return MAX_CHUNK
  return size
}

/**
 * Calculate total parts needed for file
 */
export function calculateTotalParts(fileSize: number, chunkSize: number): number {
  return Math.ceil(fileSize / chunkSize)
}

/**
 * Split file into chunks
 */
export async function splitFileIntoChunks(
  file: File,
  chunkSize: number = DEFAULT_CHUNK_SIZE
): Promise<ChunkingResult> {
  const validatedChunkSize = validateChunkSize(chunkSize)
  const totalParts = calculateTotalParts(file.size, validatedChunkSize)

  if (totalParts > 10000) {
    throw new Error(
      `File requires ${totalParts} chunks, but maximum is 10,000. Increase chunk size.`
    )
  }

  const chunks: FileChunk[] = []

  for (let i = 0; i < totalParts; i++) {
    const start = i * validatedChunkSize
    const end = Math.min(start + validatedChunkSize, file.size)
    const chunk = file.slice(start, end)

    chunks.push({
      partNumber: i + 1, // Parts start at 1
      data: chunk,
      size: chunk.size
    })
  }

  return {
    chunks,
    totalParts,
    totalSize: file.size,
    chunkSize: validatedChunkSize
  }
}

/**
 * Get chunks that need to be uploaded (for resume capability)
 */
export function getChunksToUpload(
  chunks: FileChunk[],
  uploadedPartNumbers: number[] = []
): FileChunk[] {
  const uploadedSet = new Set(uploadedPartNumbers)
  return chunks.filter((chunk) => !uploadedSet.has(chunk.partNumber))
}

/**
 * Batch part numbers for presigned URL requests (max 1000 per request per API spec)
 */
export function batchPartNumbers(partNumbers: number[], batchSize: number = 1000): number[][] {
  const batches: number[][] = []
  for (let i = 0; i < partNumbers.length; i += batchSize) {
    batches.push(partNumbers.slice(i, i + batchSize))
  }
  return batches
}

/**
 * Calculate upload progress percentage
 */
export function calculateProgress(uploadedSize: number, totalSize: number): number {
  return Math.round((uploadedSize / totalSize) * 100)
}
