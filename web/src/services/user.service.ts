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
    const response = await axiosClient.axiosInstance.post('user', newUser)
    return response.data
  }

  // verify token
  async verifySignUp(token: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.axiosInstance.post(`user/verify?token=${token}`)
    return response.data
  }

  async login(
    username: string,
    password: string
  ): Promise<
    ApiResponse<{
      accessToken: string
      refreshToken: string
      name: string
      username: string
      email: string
      userName: string
      avatarUrl?: string
    }>
  > {
    const response = await axiosClient.axiosInstance.post('auth', { username, password })
    return response.data
  }
}

export default new UserService()
