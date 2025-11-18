import axiosClient from '../../lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { Profile } from '@/types/profile'
import { DataAdminHome } from '@/types/user'

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
      role?: string
    }>
  > {
    const response = await axiosClient.axiosInstance.post('auth', { username, password })
    console.log('RESPONSE DATA', response)
    return response.data
  }

  async loginWithGoogle(authorizationCode: string): Promise<
    ApiResponse<{
      accessToken: string
      refreshToken: string
      name: string
      username: string
      email: string
      userName: string
      avatarUrl?: string
      userId?: string
    }>
  > {
    const response = await axiosClient.axiosInstance.post(`auth/oauth2/google`, null, {
      params: { code: authorizationCode }
    })
    return response.data
  }

  // request forgot password
  async requestForgotPassword(email: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.axiosInstance.post('auth/forgot-password', { email })
    return response.data
  }

  //check async token exists
  async checkForgotPasswordToken(code: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.axiosInstance.get(`auth/forgot-password/${code}`)
    return response.data
  }

  //verify token for reset password
  async resetPassword(
    code: string,
    newPassword: string
  ): Promise<
    ApiResponse<{
      name: string
      email: string
    }>
  > {
    const response = await axiosClient.axiosInstance.post(`auth/reset-password`, {
      code,
      newPassword
    })
    return response.data
  }

  //get user profile
  async getProfile(): Promise<ApiResponse<Profile>> {
    const response = await axiosClient.axiosInstance.get('self')
    return response.data
  }

  // update user (multipart for image)
  async updateUser(
    id: string,
    data: {
      description?: string
      email?: string
      imageFile?: File | null
      name?: string
      phone?: string
      position?: string
      status?: string | number
    }
  ): Promise<ApiResponse<Profile>> {
    const form = new FormData()
    if (data.description !== undefined) form.append('description', data.description)
    if (data.email !== undefined) form.append('email', data.email)
    if (data.name !== undefined) form.append('name', data.name)
    if (data.phone !== undefined) form.append('phone', data.phone)
    if (data.position !== undefined) form.append('position', data.position)
    if (data.status !== undefined) form.append('status', String(data.status))
    if (data.imageFile) form.append('image', data.imageFile)

    const response = await axiosClient.axiosInstance.put(`user/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return response.data
  }

  async getAdminHome(): Promise<ApiResponse<DataAdminHome>> {
    const response = await axiosClient.axiosInstance.get('user/home-admin')
    return response.data
  }
}

export default new UserService()
