import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

class CategoryService {
  async getAllCategories(): Promise<ApiResponse<{ id: string; name: string; description: string }[]> | null> {
    const response = await axiosClient.axiosInstance.get('learning/categories')
    return response.data
  }
}

export default new CategoryService()
