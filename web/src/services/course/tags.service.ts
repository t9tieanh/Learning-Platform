import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

class TagsService {
  async getAllTags(): Promise<ApiResponse<{ id: string; name: string; imageUrl: string }[]> | null> {
    const response = await axiosClient.axiosInstance.get('learning/tags')
    return response.data
  }
}

export default new TagsService()
