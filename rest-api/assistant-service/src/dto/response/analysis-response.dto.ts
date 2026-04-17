import { Lesson, LessonChunk, Quiz, QuizChoice, AnalysisStatus } from '@prisma/client'

// ---------------------------------------------------------------------------
// Quiz Choice DTO
// ---------------------------------------------------------------------------
export interface QuizChoiceDto {
    id: string
    text: string
    isCorrect: boolean
    feedback: string | null
}

// ---------------------------------------------------------------------------
// Quiz DTO
// ---------------------------------------------------------------------------
export interface QuizDto {
    id: string
    question: string
    explanation: string
    type: string
    difficulty: string
    bloomLevel: string
    choices: QuizChoiceDto[]
}

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
    quizzes: QuizDto[]
}

// ---------------------------------------------------------------------------
// Analysis response DTO
// ---------------------------------------------------------------------------
export type AnalysisStatusExtended = AnalysisStatus | 'NOT_FOUND'

export interface AnalysisResponseDto {
    lessonId: string
    status: AnalysisStatusExtended
    isQualityValid: boolean
    qualityReason: string | null
    summary: string | null
    suggestedTitle: string | null
    transcript: string | null
    subtitles: string | null
    chunks: ChunkDto[]
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Full Lesson type with all nested AI information – used primarily for Intelligence Bundle.
 */
export type FullLessonWithIntelligence = Lesson & {
    chunks: (LessonChunk & {
        quizzes: (Quiz & {
            choices: QuizChoice[]
        })[]
    })[]
}

/**
 * Maps a Prisma LessonChunk to a client-facing ChunkDto,
 * omitting internal fields.
 */
export function toChunkDto(chunk: LessonChunk & { quizzes?: (Quiz & { choices: QuizChoice[] })[] }): ChunkDto {
    return {
        id: chunk.id,
        chunkIndex: chunk.chunkIndex,
        title: chunk.title,
        summary: chunk.summary,
        timestamp: chunk.timestamp,
        startTime: chunk.startTime,
        endTime: chunk.endTime,
        sentenceCount: chunk.sentenceCount,
        quizzes: (chunk.quizzes || []).map((quiz: Quiz & { choices: QuizChoice[] }) => ({
            id: quiz.id,
            question: quiz.question,
            explanation: quiz.explanation,
            type: quiz.type,
            difficulty: quiz.difficulty,
            bloomLevel: quiz.bloomLevel,
            choices: (quiz.choices || []).map((choice: QuizChoice) => ({
                id: choice.id,
                text: choice.text,
                isCorrect: choice.isCorrect,
                feedback: choice.feedback
            }))
        }))
    }
}

/**
 * Builds the full AnalysisResponseDto from a Lesson + its chunks and quizzes.
 */
export function toAnalysisResponseDto(
    lesson: FullLessonWithIntelligence
): AnalysisResponseDto {
    return {
        lessonId: lesson.id,
        status: lesson.status,
        isQualityValid: lesson.isQualityValid ?? true,
        qualityReason: lesson.qualityReason,
        summary: lesson.summary,
        suggestedTitle: lesson.suggestedTitle,
        transcript: lesson.transcript,
        subtitles: lesson.subtitles,
        chunks: lesson.chunks
            .sort((a: LessonChunk, b: LessonChunk) => a.chunkIndex - b.chunkIndex)
            .map(toChunkDto),
    }
}
