import axiosClient from '@/lib/axiosClient.lib'
import type { ApiResponse } from '@/types/response.type'
import type { AnalysisResult } from '@/services/assistant/analysis.service'
import type { LessonTestBundleResponse } from '@/types/lesson-test.type'
import type { AxiosError } from 'axios'

class CourseAdminAnalysisService {
  /** Base path routed via gateway: assistant/admin/analysis → assistant-service /admin/analysis */
  private basePath = 'assistant/admin/analysis/lessons'

  async getLessonIntelligence(lessonId: string): Promise<AnalysisResult | null> {
    try {
      const res = await axiosClient.axiosInstance.get(`${this.basePath}/${lessonId}/intelligence`)
      const body = res.data as ApiResponse<AnalysisResult | null>
      return body.result ?? null
    } catch (e) {
      const err = e as AxiosError
      if (err.response?.status === 404 || err.response?.status === 403) {
        return null
      }
      throw e
    }
  }

  async getLessonTestPreview(lessonId: string): Promise<LessonTestBundleResponse | null> {
    try {
      const res = await axiosClient.axiosInstance.get(`${this.basePath}/${lessonId}/lesson-test`)
      const body = res.data as ApiResponse<LessonTestBundleResponse | null>
      if (body.code === 404 || body.result == null) {
        return null
      }
      const r = body.result
      return {
        ...r,
        quizzes: Array.isArray(r.quizzes) ? r.quizzes : [],
      }
    } catch (e) {
      const err = e as AxiosError<{ message?: string }>
      if (err.response?.status === 404) {
        return null
      }
      throw e
    }
  }
}

export default new CourseAdminAnalysisService()
