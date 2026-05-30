import {
    Lesson,
    LessonChunk,
    Quiz,
    QuizChoice,
    AnalysisStatus,
    LessonTest,
    LessonTestChunkGroup,
} from '@prisma/client'
import lessonTestMergedContextService from '~/service/lessonTest/lessonTestMergedContext.service'

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

/** Lesson-test blueprint header (optional 1:1 with lesson). */
export interface AnalysisLessonTestHeaderDto {
    lessonId: string
    title: string | null
    status: string
    targetTotalQuestions: number | null
    notes: string | null
}

/** Persisted lesson-test chunk groups for instructor UI (merged-context quiz blueprint). */
export interface AnalysisLessonTestChunkGroupDto {
    id: string
    lessonId: string
    chunkIds: string[]
    questionCount: number
    label: string | null
    batchUserPrompt: string | null
    distribution: unknown
    createdAt: string
    updatedAt: string
}

export interface AnalysisResponseDto {
    lessonId: string
    status: AnalysisStatusExtended
    isQualityValid: boolean
    qualityReason: string | null
    summary: string | null
    suggestedTitle: string | null
    transcript: string | null
    subtitles: string | null
    lessonType: string | null
    chunks: ChunkDto[]
    /** Present when a `lesson_tests` row exists for this lesson */
    lessonTest: AnalysisLessonTestHeaderDto | null
    /** Ordered chunk groups from DB (empty if no blueprint or no groups yet) */
    lessonTestChunkGroups: AnalysisLessonTestChunkGroupDto[]
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
    lessonTest:
        | (LessonTest & {
              chunkGroups: LessonTestChunkGroup[]
          })
        | null
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

function mapLessonTestChunkGroups(
    lessonTest: LessonTest & { chunkGroups: LessonTestChunkGroup[] }
): AnalysisLessonTestChunkGroupDto[] {
    return [...lessonTest.chunkGroups]
        .sort(
            (a, b) =>
                new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        )
        .map((g) => ({
            id: g.id,
            lessonId: g.lessonId,
            chunkIds: lessonTestMergedContextService.parseChunkIds(g.chunkIds),
            questionCount: g.questionCount,
            label: g.label,
            batchUserPrompt: g.batchUserPrompt,
            distribution: g.distribution,
            createdAt: g.createdAt.toISOString(),
            updatedAt: g.updatedAt.toISOString(),
        }))
}

/**
 * Builds the full AnalysisResponseDto from a Lesson + its chunks and quizzes.
 */
export function toAnalysisResponseDto(
    lesson: FullLessonWithIntelligence
): AnalysisResponseDto {
    const lt = lesson.lessonTest ?? null

    return {
        lessonId: lesson.id,
        status: lesson.status,
        isQualityValid: lesson.isQualityValid ?? true,
        qualityReason: lesson.qualityReason,
        summary: lesson.summary,
        suggestedTitle: lesson.suggestedTitle,
        transcript: lesson.transcript,
        subtitles: lesson.subtitles,
        lessonType: lesson.type,
        chunks: lesson.chunks
            .sort((a: LessonChunk, b: LessonChunk) => a.chunkIndex - b.chunkIndex)
            .map(toChunkDto),
        lessonTest: lt
            ? {
                  lessonId: lt.lessonId,
                  title: lt.title,
                  status: lt.status,
                  targetTotalQuestions: lt.targetTotalQuestions,
                  notes: lt.notes,
              }
            : null,
        lessonTestChunkGroups: lt ? mapLessonTestChunkGroups(lt) : [],
    }
}
