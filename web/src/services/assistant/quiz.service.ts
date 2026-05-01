import axiosClient from '@/lib/axiosClient.lib'
import type { ApiResponse } from '@/types/response.type'
import type {
  GeneratedQuiz,
  GeneratedQuizResponse,
  BatchGeneratedQuizResponse,
  QuizBatchDistribution,
  QuizBatchDistributionItem,
  QuizDifficulty,
  QuestionType,
  BloomLevel,
  UpdateQuizPayload,
} from '@/types/quiz'

// ---------------------------------------------------------------------------
// Types for Requests
// ---------------------------------------------------------------------------

export interface SingleQuizGenerationRequest {
  difficulty: QuizDifficulty
  bloomLevel: BloomLevel
  questionType: QuestionType
  numberOfQuestions: number
  userPrompt?: string
}

export interface BatchQuizGenerationRequest {
  count: number
  distribution: QuizBatchDistributionItem[]
  userPrompt?: string
}

export interface BatchQuizGenerationRequestLegacy {
  distribution: QuizBatchDistribution
  numberOfQuestions: number
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

class QuizService {
  /**
   * Generate a single quiz for a chunk with specified difficulty and Bloom level
   */
  async generateSingleQuiz(
    chunkId: string,
    request: SingleQuizGenerationRequest
  ): Promise<ApiResponse<GeneratedQuizResponse>> {
    const res = await axiosClient.axiosInstance.post(
      `assistant/quizzes/chunks/${chunkId}/quizzes`,
      request,
      { timeout: 60_000 } // Long timeout for OpenAI calls
    )
    return res.data as ApiResponse<GeneratedQuizResponse>
  }

  /**
   * Generate multiple quizzes for a chunk with batch distribution
   * (by difficulty and Bloom level)
   */
  async generateBatchQuizzes(
    chunkId: string,
    request: BatchQuizGenerationRequest
  ): Promise<ApiResponse<BatchGeneratedQuizResponse>> {
    const res = await axiosClient.axiosInstance.post(
      `assistant/quizzes/chunks/${chunkId}/quizzes/batch`,
      request,
      { timeout: 120_000 } // Longer timeout for batch generation
    )
    return res.data as ApiResponse<BatchGeneratedQuizResponse>
  }

  /**
   * Retrieve all quizzes for a chunk
   */
  async getChunkQuizzes(chunkId: string): Promise<ApiResponse<GeneratedQuiz[]>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/quizzes/chunks/${chunkId}/quizzes`
    )
    return res.data as ApiResponse<GeneratedQuiz[]>
  }

  /**
   * Retrieve a specific quiz by ID
   */
  async getQuizById(chunkId: string, quizId: string): Promise<ApiResponse<GeneratedQuiz>> {
    const res = await axiosClient.axiosInstance.get(
      `assistant/quizzes/chunks/${chunkId}/quizzes/${quizId}`
    )
    return res.data as ApiResponse<GeneratedQuiz>
  }

  /**
   * Instructor edit — full choice replace; works for chunk quizzes and LESSON_TEST rows.
   */
  async updateQuiz(quizId: string, body: UpdateQuizPayload): Promise<ApiResponse<GeneratedQuiz>> {
    const res = await axiosClient.axiosInstance.patch(`assistant/quizzes/quiz/${quizId}`, body)
    return res.data as ApiResponse<GeneratedQuiz>
  }
}

export default new QuizService()
