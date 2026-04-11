import axiosClient from '@/lib/axiosClient.lib'
import type { ApiResponse } from '@/types/response.type'
import type { LessonChunk } from '@/types/ai'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AnalysisResult {
  lessonId: string
  status: 'completed' | 'processing' | 'not_found'
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
   * Updates the summary of a specific chunk.
   */
  async updateChunkSummary(lessonId: string, chunkId: string, summary: string): Promise<ApiResponse<LessonChunk>> {
    const res = await axiosClient.axiosInstance.patch(
      `assistant/analysis/lessons/${lessonId}/chunks/${chunkId}/summary`,
      { summary }
    )
    return res.data as ApiResponse<LessonChunk>
  }
}

export default new AssistantAnalysisService()
