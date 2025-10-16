import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

class ChapterService {
  async getChaptersByCourseId(
    courseId: string
  ): Promise<ApiResponse<{ id: string; title: string; position: number; isOpen: boolean; lessons: any[] }[]> | null> {
    const response = await axiosClient.axiosInstance.get(`/learning/chapters`, {
      params: {
        courseId: courseId
      }
    })
    return response.data
  }

  async addChapter({ courseId, title, position }: { courseId: string; title: string; position: number }): Promise<
    ApiResponse<{
      id: string
      name: string
    }>
  > {
    const response = await axiosClient.axiosInstance.post(`/learning/chapters`, {
      courseId,
      title,
      position
    })
    return response.data
  }

  async updateChapter({
    id,
    title,
    position,
    description
  }: {
    id: string
    title: string
    position: number
    description: string
  }): Promise<
    ApiResponse<{
      id: string
      title: string
      description: string
      position: number
    }>
  > {
    const response = await axiosClient.axiosInstance.patch(`/learning/chapters/${id}`, {
      title,
      position,
      description
    })
    return response.data
  }
}

export default new ChapterService()
