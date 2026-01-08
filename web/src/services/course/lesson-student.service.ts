import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'

class LessonStudentService {
  async markDone(lessonId: string): Promise<
    ApiResponse<{
      id: string
    }>
  > {
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
}

export default new LessonStudentService()
