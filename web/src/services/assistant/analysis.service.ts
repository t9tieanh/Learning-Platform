import axiosClient from '@/lib/axiosClient.lib'
import type { ApiResponse } from '@/types/response.type'
import type { LessonChunk } from '@/types/ai'

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
}

export interface AnalysisResult {
  lessonId: string
  status: 'completed' | 'processing' | 'not_found' | 'failed' | 'COMPLETED' | 'PROCESSING' | 'FAILED' | 'NOT_FOUND'
  isQualityValid: boolean
  qualityReason: string | null
  summary: string | null
  suggestedTitle: string | null
  subtitles: string | null
  chunks: LessonChunk[]
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
   * Ask AI a question about the lesson.
   */
  async askAI(lessonId: string, question: string): Promise<ApiResponse<RAGResult>> {
    const res = await axiosClient.axiosInstance.post(
      `assistant/analysis/lessons/${lessonId}/chat`,
      { question }
    )
    return res.data as ApiResponse<RAGResult>
  }
}

export default new AssistantAnalysisService()
