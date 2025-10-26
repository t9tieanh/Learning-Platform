import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'

export interface CourseResponse {
  id: string
  title: string
  shortDescription: string | null
  longDescription: string | null
  thumbnailUrl: string | null
  rating: number | null
  introductoryVideo: string | null
  language: string | null
  originalPrice: number | null
  finalPrice: number | null
  instructor: {
    id: string
    name: string
    email: string | null
    image: string | null
  }
  chapters: {
    id: string
    title: string
    description: string | null
    position: number
    isOpen: boolean
    lessonNum: number
    duration: number
  }[]
  tags: {
    id: string
    name: string
    imageUrl: string
  }[]
  category: {
    id: string
    name: string
    description: string | null
  } | null
  outcomes: string[]
  requirements: string[]
}

class CourseUserService {
  async getCourseDetails(courseId: string): Promise<ApiResponse<CourseResponse>> {
    const response = await axiosClient.axiosInstance.get(`learning/courses-user/${courseId}`)
    return response.data
  }
}

export default new CourseUserService()
