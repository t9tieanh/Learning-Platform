import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'

class LessonService {
  async delLesson(lessonId: string): Promise<
    ApiResponse<{
      id: string
      name: string
    }>
  > {
    const response = await axiosClient.axiosInstance.delete(`learning/lessons/${lessonId}`)
    return response.data
  }

  async updateNameLesson(data: { id: string; title: string }): Promise<
    ApiResponse<{
      id: string
      title: string
    }>
  > {
    const response = await axiosClient.axiosInstance.patch(`learning/lessons/${data.id}/name`, {
      title: data.title
    })
    return response.data
  }

  async updateLessonContent(data: { id: string; title: string; content: string }): Promise<
    ApiResponse<{
      id: string
      title: string
      content: string
    }>
  > {
    const response = await axiosClient.axiosInstance.patch(`learning/lessons/${data.id}`, {
      title: data.title,
      content: data.content
    })
    return response.data
  }

  async updateMetaLesson(data: { id: string; title: string; content: string; isPublic: boolean }): Promise<
    ApiResponse<{
      id: string
      title: string
      content: string
      isPublic: boolean
    }>
  > {
    console.log('Updating lesson metadata:', data)
    const response = await axiosClient.axiosInstance.patch(`learning/lessons/${data.id}`, {
      title: data.title,
      content: data.content,
      isPublic: data.isPublic
    })
    return response.data
  }
}

export default new LessonService()
