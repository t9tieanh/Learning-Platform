import { ApiResponse } from '@/types/response.type'
import axios from 'axios'
import axiosClient from '@/lib/axiosClient.lib'
import {
  lessonVideoDevBasicPassword,
  lessonVideoDevBasicUsername,
  useDevLessonVideoPresignedApi
} from '@/config/lesson-video.config'

export interface MarkDoneLessonResult {
  id: string
  isCompletedCourse: boolean
  certificateId?: string | null
  certificateCode?: string | null
}

class LessonStudentService {
  async markDone(lessonId: string): Promise<ApiResponse<MarkDoneLessonResult>> {
    const response = await axiosClient.axiosInstance.post(`/learning/lesson-student/${lessonId}/mark-done`)
    return response.data
  }

  async makeNote(
    lessonId: string,
    content: string
  ): Promise<
    ApiResponse<{
      id: string
    }>
  > {
    const response = await axiosClient.axiosInstance.post(`/learning/lesson-student/${lessonId}/make-note`, {
      content
    })
    return response.data
  }

  async getLessonInfo(lessonId: string): Promise<
    ApiResponse<{
      id: string
      title: string
      content: string
      type: string
      duration: number
      position: string
      note: string
      thumbnailUrl: string
      completionStatus: string | null
    }>
  > {
    const response = await axiosClient.axiosInstance.get(`/learning/lesson-student/${lessonId}/info`)
    return response.data
  }
  async getPresignedUrl(lessonId: string): Promise<ApiResponse<string>> {
    const response = await axiosClient.axiosInstance.get(`/learning/lesson-student/${lessonId}/presigned-url`)
    return response.data
  }

  /** Dev localhost: Basic Auth + signed URL without IP (CloudFront canned policy). */
  async getDevPresignedUrl(lessonId: string): Promise<ApiResponse<string>> {
    const baseURL = (import.meta.env.VITE_API as string) + '/api/v1'
    const response = await axios.get<ApiResponse<string>>(
      `${baseURL}/learning/lesson-student/${lessonId}/dev-presigned-url`,
      {
        auth: {
          username: lessonVideoDevBasicUsername,
          password: lessonVideoDevBasicPassword
        }
      }
    )
    return response.data
  }

  async getLessonVideoUrl(lessonId: string): Promise<ApiResponse<string>> {
    if (useDevLessonVideoPresignedApi) {
      return this.getDevPresignedUrl(lessonId)
    }
    return this.getPresignedUrl(lessonId)
  }

  async getPresignedCookies(lessonId: string): Promise<ApiResponse<{
    policy: string
    signature: string
    keyPairId: string
    expires: string
    domain: string
    url: string
  }>> {
    const response = await axiosClient.axiosInstance.get(`/learning/lesson-student/${lessonId}/presigned-cookies`)
    return response.data
  }
}

export default new LessonStudentService()
