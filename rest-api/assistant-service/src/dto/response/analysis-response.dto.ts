import { Lesson, LessonChunk } from '@prisma/client'

// ---------------------------------------------------------------------------
// Chunk DTO – fields exposed to the client
// ---------------------------------------------------------------------------
export interface ChunkDto {
    id: string
    chunkIndex: number
    title: string | null
    summary: string | null
    timestamp: string | null
    startTime: string | null
    endTime: string | null
    sentenceCount: number | null
}

// ---------------------------------------------------------------------------
// Analysis response DTO
// ---------------------------------------------------------------------------
export type AnalysisStatus = 'completed' | 'processing' | 'not_found'

export interface AnalysisResponseDto {
    lessonId: string
    status: AnalysisStatus
    summary: string | null
    suggestedTitle: string | null
    subtitles: string | null
    chunks: ChunkDto[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Maps a Prisma LessonChunk to a client-facing ChunkDto,
 * omitting internal fields (content, subtitleIndex, sentence indexes …).
 */
export function toChunkDto(chunk: LessonChunk): ChunkDto {
    return {
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        title: chunk.title,
        summary: chunk.summary,
        timestamp: chunk.timestamp,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        sentenceCount: chunk.sentenceCount,
    }
}

/**
 * Builds the full AnalysisResponseDto from a Lesson + its chunks.
 */
export function toAnalysisResponseDto(
    lesson: Lesson & { chunks: LessonChunk[] }
): AnalysisResponseDto {
    return {
        lessonId: lesson.id,
        status: lesson.summary ? 'completed' : 'processing',
        summary: lesson.summary,
        suggestedTitle: lesson.suggestedTitle,
        subtitles: lesson.subtitles,
        chunks: lesson.chunks
            .sort((a, b) => a.chunkIndex - b.chunkIndex)
            .map(toChunkDto),
    }
}
