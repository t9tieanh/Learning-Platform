import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'

// Types for admin course list response
export interface InstructorInfo {
  id: string
  name: string
  email: string
  image?: string | null
  totalCourse: number
}

export interface CourseAdminItem {
  id: string
  title: string
  shortDescription?: string | null
  longDescription?: string | null
  thumbnailUrl?: string | null
  language?: string | null
  originalPrice?: number | null
  finalPrice?: number | null
  rating?: number | null
  instructorId?: string | null
  status?: string | null
  instructor?: InstructorInfo | null
  progressStep?: string | null
}

export interface CoursesAdminResult {
  items: CourseAdminItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

class CourseAdminService {
  async getCourseDetailAdmin(courseId: string): Promise<ApiResponse<any>> {
    const response = await axiosClient.axiosInstance.get(`learning/admin/courses/${courseId}`)
    return response.data
  }

  async getCourse(): Promise<ApiResponse<any>> {
    const response = await axiosClient.axiosInstance.get(`learning/admin/courses`)
    return response.data
  }

  async getCoursesAdmin(page = 0, limit = 10): Promise<ApiResponse<CoursesAdminResult>> {
    const response = await axiosClient.axiosInstance.get(`learning/admin/courses`, {
      params: { page, limit }
    })

    return response.data
  }
}

export default new CourseAdminService()
