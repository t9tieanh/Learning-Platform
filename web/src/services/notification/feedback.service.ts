import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

class FeedbackService {
  async addFeedBack(courseId: string, rating: number, comment: string) {
    const response = await axiosClient.axiosInstance.post('/notify/feedback', {
      courseId,
      rating,
      comment
    })
    return response.data
  }

  async getFeedbackByUserAndCourse(courseId: string): Promise<
    ApiResponse<{
      _id: string
      userId: string
      courseId: string
      rating: number
      message: string
      createdAt: string
      updatedAt: string
      __v: number
    }>
  > {
    const response = await axiosClient.axiosInstance.get(`/notify/feedback/course/${courseId}`)
    return response.data
  }
}

export default new FeedbackService()
