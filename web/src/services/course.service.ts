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
    const response = await axiosClient.axiosInstance.post('/courses/teacher', body)
    return response.data
  }

  // Lấy chi tiết khóa học theo id
  async getCourseDetail(courseId: string): Promise<ApiResponse<any>> {
    if (!courseId) throw new Error('Thiếu courseId')
    const response = await axiosClient.axiosInstance.get(`/courses/details/${courseId}`)
    return response.data
  }
}

export default new CourseService()
