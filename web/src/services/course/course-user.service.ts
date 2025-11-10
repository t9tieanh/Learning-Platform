import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'
import { Course } from '@/components/TC_Courses/CourseTypes'

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
    image: string
    phone: string
    description: string
    email: string
    username: string | null
    numCourse: number
    expertise: {
      id: string
      name: string
      image: string
    }
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

type Paginated<T> = {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

class CourseUserService {
  async getCourseDetails(courseId: string): Promise<ApiResponse<CourseResponse>> {
    const response = await axiosClient.axiosInstance.get(`learning/courses/${courseId}`)
    return response.data
  }

  async getAllCourses(params?: {
    page?: number
    limit?: number
    search?: string
    category?: string
    minPrice?: number
    minRating?: number
  }): Promise<ApiResponse<Paginated<any>>> {
    const { page = 1, limit = 10, search, category, minPrice, minRating } = params || {}
    const response = await axiosClient.axiosInstance.get('learning/courses', {
      params: {
        page,
        limit,
        search,
        category,
        minPrice,
        minRating
      }
    })
    return response.data
  }

  async getBestSellerCourses(limit = 4): Promise<Course[]> {
    const response = await axiosClient.axiosInstance.get('learning/courses/best-seller', {
      params: { limit }
    })
    return response.data
  }

  async getTrendyCourseThisMonth(limit = 4): Promise<Course[]> {
    const response = await axiosClient.axiosInstance.get('learning/courses/trend', {
      params: { limit }
    })
    return response.data
  }

  // Enrolled courses between a student and an instructor (for tooltip in chat)
  async getEnrolledCourses(params: {
    userRole: 'student' | 'instructor'
    studentId: string
    instructorId: string
  }): Promise<ApiResponse<EnrolledCourseItem[]>> {
    const response = await axiosClient.axiosInstance.get('learning/courses/enrolled', {
      params
    })
    return response.data
  }

  async countInstructorCourseValid(params: { instructorId: string }) {
    const response = await axiosClient.axiosInstance.get('learning/courses/count', {
      params
    })
    return response.data
  }
}

export default new CourseUserService()

export type EnrolledCourseItem = {
  id: string
  title: string
  thumbnailUrl: string | null
}
