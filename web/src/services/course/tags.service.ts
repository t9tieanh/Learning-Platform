import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

class TagsService {
  async getAllTags(): Promise<ApiResponse<{ id: string; name: string; imageUrl: string }[]> | null> {
    const response = await axiosClient.axiosInstance.get('learning/tags')
    return response.data
  }

  async addTagsToCourse(courseId: string, tagIds: string[]): Promise<ApiResponse<null> | null> {
    const response = await axiosClient.axiosInstance.patch(`learning/courses/${courseId}/tags`, {
      tagIds
    })
    return response.data
  }

  async getAllByCourseId(
    courseId: string
  ): Promise<ApiResponse<{ id: string; name: string; imageUrl: string }[]> | null> {
    const response = await axiosClient.axiosInstance.get(`learning/courses/${courseId}/tags`)
    return response.data
  }
}

export default new TagsService()
