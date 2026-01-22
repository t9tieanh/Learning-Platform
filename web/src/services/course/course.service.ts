import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { useAuthStore } from '@/stores/useAuth.stores'
import { Course } from '@/types/course.type'
import { boolean } from 'yup'

function decodeJwtPayload(token: string): any | null {
  try {
    const base64 = token.split('.')[1]
    if (!base64) return null
    const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
    return JSON.parse(decodeURIComponent(escape(json)))
  } catch {
    try {
      // Fallback without escape (modern browsers)
      const base64 = token.split('.')[1]
      if (!base64) return null
      const json = atob(base64.replace(/-/g, '+').replace(/_/g, '/'))
      return JSON.parse(json)
    } catch {
      return null
    }
  }
}

// function getCurrentInstructorId(): string | null {
//   const { data } = useAuthStore.getState()
//   if (!data) return null
//   const direct = (data as any).id || (data as any).userId || (data as any).instructorId
//   if (direct) return String(direct)
//   const token = data.accessToken
//   if (token) {
//     const payload = decodeJwtPayload(token)
//     const pid = payload?.id || payload?.userId || payload?.uid || payload?.sub
//     if (pid) return String(pid)
//   }
//   return null
// }

type Paginated<T> = {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

class CourseService {
  // Admin: get instructor summaries
  async getAdminInstructors(): Promise<ApiResponse<AdminInstructorSummary[]>> {
    const response = await axiosClient.axiosInstance.get('learning/admin/instructor')
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
    const response = await axiosClient.axiosInstance.get('learning/courses-user', {
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

  async getCourseDetail(courseId: string): Promise<ApiResponse<any>> {
    if (!courseId) throw new Error('Thiếu courseId')
    const response = await axiosClient.axiosInstance.get(`learning/instructor/courses/details/${courseId}`)
    return response.data
  }

  async createCourse(request: {
    id?: string
    title: string
    shortDescription: string
    longDescription?: string
    thumbnailUrl?: string
    language?: string
    outcomes?: string[]
    requirements?: string[]
    categoryIds: string
  }): Promise<ApiResponse<{ id: string; name: string }> | null> {
    const response = await axiosClient.axiosInstance.post('learning/instructor/courses', request)
    return response.data
  }

  async getTeacherCourses(
    options?: { page?: number; limit?: number }
  ): Promise<ApiResponse<Paginated<any>>> {
    const params = {
      page: options?.page ?? 1,
      limit: options?.limit ?? 10
    }
    const response = await axiosClient.axiosInstance.get('learning/instructor/courses', { params })
    return response.data
  }

  async getCourseInfo(courseId: string): Promise<
    ApiResponse<{
      title: string
      shortDescription: string
      longDescription: string
      thumbnailUrl: string
      language: string
      originalPrice: number | null
      finalPrice: null
      outcomes: string[]
      requirements: string[]
      category: string
      introductoryVideo: string
      progressStep: string
      status?: string
    }>
  > {
    const response = await axiosClient.axiosInstance.get(`learning/instructor/courses/${courseId}/info`)
    return response.data
  }

  async updateAvatar(
    courseId: string,
    file: File
  ): Promise<
    ApiResponse<{
      imageUrl: string
    }>
  > {
    const formData = new FormData()
    formData.append('file', file)

    const response = await axiosClient.axiosInstance.patch(`learning/instructor/courses/${courseId}/avatar`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  }

  async updatePrice(
    courseId: string,
    originalPrice: number,
    finalPrice: number
  ): Promise<
    ApiResponse<{
      id: string
    }>
  > {
    const response = await axiosClient.axiosInstance.patch(`learning/instructor/courses/${courseId}/price`, {
      originalPrice: originalPrice * 1000,
      finalPrice: finalPrice * 1000
    })
    return response.data
  }

  async getPrice(courseId: string): Promise<
    ApiResponse<{
      originalPrice: number
      finalPrice: number
      id: string
      name: string
      yourIncome: number
      platformFee: number
    }>
  > {
    const response = await axiosClient.axiosInstance.get(`learning/instructor/courses/${courseId}/price`)
    return response.data
  }

  async getCourseOverview(courseId: string): Promise<
    ApiResponse<{
      lessonNum: number
      videoDuration: number
      courseId: string
      finalPrice: string
    }>
  > {
    const response = await axiosClient.axiosInstance.get(`learning/instructor/courses/${courseId}/overview`)
    return response.data
  }

  async requestApproval(courseId: string): Promise<
    ApiResponse<{
      id: string
      name: string
    }>
  > {
    const response = await axiosClient.axiosInstance.post(`learning/instructor/courses/${courseId}/request-approval`)
    return response.data
  }

  async getBestSellerCourses(limit = 4): Promise<Course[]> {
    const response = await axiosClient.axiosInstance.get('learning/courses-user/best-seller', {
      params: { limit }
    })
    return response.data
  }

  async getTrendyCourseThisMonth(limit = 4): Promise<Course[]> {
    const response = await axiosClient.axiosInstance.get('learning/courses-user/trend', {
      params: { limit }
    })
    return response.data
  }

  async delCourse(courseId: string): Promise<
    ApiResponse<{
      id: string
      name: string
    }>
  > {
    const response = await axiosClient.axiosInstance.delete(`learning/instructor/courses/${courseId}`)
    return response.data
  }
}

export default new CourseService()

// Types
export type AdminInstructorSummary = {
  instructorQuantity: number
  instructorName: string
  instructorEmail: string
  totalCourse: number
}
