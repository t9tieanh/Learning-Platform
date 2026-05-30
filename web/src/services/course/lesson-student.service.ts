import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'

export interface MarkDoneLessonResult {
  id: string
  isCompletedCourse: boolean
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
