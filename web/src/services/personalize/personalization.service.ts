import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

export type PersonalizationPayload = {
  userId: string
  categories: string[]
  tags: string[]
  longDescriptions: string[]
}

export type PersonalizationResponse = {
  categories: string[]
  tags: string[]
  longDescriptions: string[]
}

class PersonalizationService {
  async save(payload: PersonalizationPayload): Promise<ApiResponse<PersonalizationResponse> | null> {
    const response = await axiosClient.axiosInstance.post('/user/personalization', payload)
    return response.data
  }

  async getByUserId(userId: string): Promise<ApiResponse<PersonalizationResponse> | null> {
    const response = await axiosClient.axiosInstance.get(`/user/personalization/${userId}`)
    return response.data
  }
}

export default new PersonalizationService()
