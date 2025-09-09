import axiosClient from '../lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

class UserService {
  async signUp(newUser: {
    name: string
    phone: string
    username: string
    password: string
    email: string
  }): Promise<ApiResponse<any>> {
    const response = await axiosClient.axiosInstance.post('user/', newUser)
    return response.data
  }
}

export default new UserService()
