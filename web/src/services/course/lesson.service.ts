import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'

class LessonService {
  async delLesson(lessonId: string): Promise<
    ApiResponse<{
      id: string
      name: string
    }>
  > {
    const response = await axiosClient.axiosInstance.delete(`/lessons/${lessonId}`)
    return response.data
  }
}

export default new LessonService()
