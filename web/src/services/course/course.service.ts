import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { useAuthStore } from '@/stores/useAuth.stores'

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

function getCurrentInstructorId(): string | null {
  const { data } = useAuthStore.getState()
  if (!data) return null
  const direct = (data as any).id || (data as any).userId || (data as any).instructorId
  if (direct) return String(direct)
  const token = data.accessToken
  if (token) {
    const payload = decodeJwtPayload(token)
    const pid = payload?.id || payload?.userId || payload?.uid || payload?.sub
    if (pid) return String(pid)
  }
  return null
}

type Paginated<T> = {
  items: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

class CourseService {
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
    const response = await axiosClient.axiosInstance.post('learning/courses', request)
    return response.data
  }

  async getTeacherCourses(
    instructorId?: string,
    options?: { page?: number; limit?: number }
  ): Promise<ApiResponse<Paginated<any>>> {
    const id = instructorId ?? getCurrentInstructorId()
    if (!id) {
      throw new Error('Không tìm thấy ID giảng viên từ phiên đăng nhập')
    }
    const body = {
      instructorId: id,
      page: options?.page ?? 1,
      limit: options?.limit ?? 10
    }
    const response = await axiosClient.axiosInstance.post('learning/courses/teacher', body)
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
    }>
  > {
    const response = await axiosClient.axiosInstance.get(`learning/courses/${courseId}/info`)
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

    const response = await axiosClient.axiosInstance.patch(`learning/courses/${courseId}/avatar`, formData, {
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
    const response = await axiosClient.axiosInstance.patch(`learning/courses/${courseId}/price`, {
      originalPrice,
      finalPrice
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
    const response = await axiosClient.axiosInstance.get(`learning/courses/${courseId}/price`)
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
    const response = await axiosClient.axiosInstance.get(`learning/courses/${courseId}/overview`)
    return response.data
  }

  async requestApproval(courseId: string): Promise<
    ApiResponse<{
      id: string
      name: string
    }>
  > {
    const response = await axiosClient.axiosInstance.post(`learning/courses/${courseId}/request-approval`)
    return response.data
  }
}

export default new CourseService()
