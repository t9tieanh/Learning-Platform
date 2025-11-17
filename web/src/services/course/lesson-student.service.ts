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
}

export default new LessonStudentService()
