import axiosClient from '@/lib/axiosClient.lib'
import type { ApiResponse } from '@/types/response.type'
import type { LessonChunk } from '@/types/ai'
import { LessonType } from '@/types/lesson'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RAGSource {
  chunkId: string
  title: string | null
  summary: string | null
  chunkIndex: number
  startTime: string | null
  endTime: string | null
  timestamp: string | null
  similarity: number
}

export interface RAGResult {
  answer: string
  sources: RAGSource[]
  /** Persisted chat thread id — send on the next ask to keep context */
  sessionId?: string
}

/** Matches assistant-service lesson chat enums / DTO shapes (dates as ISO strings over JSON). */
export type LessonChatMessageRoleDto = 'USER' | 'ASSISTANT' | 'SYSTEM'

export interface LessonChatSessionListItemDto {
  id: string
  lessonId: string
  title: string | null
  summaryLast: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  messageCount: number
}

export interface LessonChatMessageItemDto {
  id: string
  role: LessonChatMessageRoleDto
  content: string
  metadata: { sources?: RAGSource[] } | null
  createdAt: string
}

/** Mirrors assistant-service `AnalysisLessonTestHeaderDto` */
export interface AnalysisLessonTestHeaderSnapshot {
  lessonId: string
  title: string | null
  status: string
  targetTotalQuestions: number | null
  notes: string | null
}

/** Mirrors assistant-service `AnalysisLessonTestChunkGroupDto` */
export interface AnalysisLessonTestChunkGroupSnapshot {
  id: string
  lessonId: string
  chunkIds: string[]
  questionCount: number
  label: string | null
  batchUserPrompt: string | null
  distribution?: unknown
  createdAt?: string
  updatedAt?: string
}

export interface AnalysisResult {
  lessonId: string
  status: 'completed' | 'processing' | 'not_found' | 'failed' | 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'NOT_FOUND'
  isQualityValid: boolean
  qualityReason: string | null
  summary: string | null
  suggestedTitle: string | null
  subtitles: string | null
  lessonType: LessonType | null
  chunks: LessonChunk[]
  /** Lesson-test blueprint header when a row exists in `lesson_tests` */
  lessonTest?: AnalysisLessonTestHeaderSnapshot | null
  /** Persisted chunk groups for lesson-test UI (non-empty → hydrate blueprint from DB) */
  lessonTestChunkGroups?: AnalysisLessonTestChunkGroupSnapshot[]
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class AssistantAnalysisService {
  /**
   * Fetches AI analysis for a lesson.
   * The backend holds the connection for up to 25s (long-poll).
   *
   * Returns:
   *  - 200 { status:'completed' }  → data ready
   *  - 202 { status:'processing' } → still running, caller should retry
   *  - 404 result:null             → lesson not in assistant-service yet
   */
  async getAnalysis(lessonId: string): Promise<ApiResponse<AnalysisResult | null>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/analysis/lessons/${lessonId}`,
      { timeout: 60_000 } // > 25s server timeout
    )
    return res.data as ApiResponse<AnalysisResult | null>
  }

  /**
   * Directly get the analysis document from DB. No long-polling.
   */
  async getAnalysisDetail(lessonId: string): Promise<ApiResponse<AnalysisResult | null>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/analysis/lessons/${lessonId}/detail`
    )
    return res.data as ApiResponse<AnalysisResult | null>
  }

  /**
   * Updates the summary of a specific chunk.
   */
  async updateChunkSummary(lessonId: string, chunkId: string, summary: string): Promise<ApiResponse<LessonChunk>> {
    const res = await axiosClient.axiosInstance.patch(
      `assistant/analysis/lessons/${lessonId}/chunks/${chunkId}/summary`,
      { summary }
    )
    return res.data as ApiResponse<LessonChunk>
  }

  /**
   * Ask AI about the lesson (RAG). Pass `sessionId` from the previous response for multi-turn memory.
   */
  async askAI(
    lessonId: string,
    question: string,
    sessionId?: string | null
  ): Promise<ApiResponse<RAGResult>> {
    const res = await axiosClient.axiosInstance.post(
      `assistant/analysis/lessons/${lessonId}/chat`,
      {
        question,
        ...(sessionId ? { sessionId } : {}),
      }
    )
    return res.data as ApiResponse<RAGResult>
  }

  async listLessonChatSessions(
    lessonId: string
  ): Promise<ApiResponse<LessonChatSessionListItemDto[]>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/analysis/lessons/${lessonId}/chat/sessions`
    )
    return res.data as ApiResponse<LessonChatSessionListItemDto[]>
  }

  async getLessonChatMessages(
    lessonId: string,
    sessionId: string
  ): Promise<ApiResponse<LessonChatMessageItemDto[]>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/analysis/lessons/${lessonId}/chat/sessions/${sessionId}/messages`
    )
    return res.data as ApiResponse<LessonChatMessageItemDto[]>
  }

  async createLessonChatSession(
    lessonId: string
  ): Promise<ApiResponse<{ sessionId: string }>> {
    const res = await axiosClient.axiosInstance.post(
      `assistant/analysis/lessons/${lessonId}/chat/sessions`
    )
    return res.data as ApiResponse<{ sessionId: string }>
  }

  async updateLessonChatSessionTitle(
    lessonId: string,
    sessionId: string,
    title: string
  ): Promise<ApiResponse<null>> {
    const res = await axiosClient.axiosInstance.patch(
      `assistant/analysis/lessons/${lessonId}/chat/sessions/${sessionId}/title`,
      { title }
    )
    return res.data as ApiResponse<null>
  }

  async updateLessonChatSessionNotes(
    lessonId: string,
    sessionId: string,
    notes: string
  ): Promise<ApiResponse<null>> {
    const res = await axiosClient.axiosInstance.patch(
      `assistant/analysis/lessons/${lessonId}/chat/sessions/${sessionId}/notes`,
      { notes }
    )
    return res.data as ApiResponse<null>
  }
}

export default new AssistantAnalysisService()
