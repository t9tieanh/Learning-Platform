import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import {
  AdminInstructorCoursesResult,
  AdminInstructorListResult,
  AdminInstructorSummaryResult
} from '@/types/admin-instructor'

export interface GetAdminInstructorsParams {
  page?: number
  limit?: number
  search?: string
  sort?: string
  courseRange?: string
}

class CourseAdminInstructorService {
  async getAdminInstructors(
    params: GetAdminInstructorsParams = {}
  ): Promise<ApiResponse<AdminInstructorListResult>> {
    const { page = 1, limit = 10, search, sort = 'courses_desc', courseRange = 'all' } = params
    const response = await axiosClient.axiosInstance.get('learning/admin/instructors', {
      params: {
        page,
        limit,
        search: search?.trim() || undefined,
        sort,
        courseRange
      }
    })
    return response.data
  }

  async getAdminInstructorSummary(
    instructorId: string,
    year: number
  ): Promise<ApiResponse<AdminInstructorSummaryResult>> {
    const response = await axiosClient.axiosInstance.get(`learning/admin/instructors/${instructorId}/summary`, {
      params: { year }
    })
    return response.data
  }

  async getAdminInstructorCourses(
    instructorId: string,
    params: { page?: number; limit?: number } = {}
  ): Promise<ApiResponse<AdminInstructorCoursesResult>> {
    const { page = 1, limit = 5 } = params
    const response = await axiosClient.axiosInstance.get(`learning/admin/instructors/${instructorId}/courses`, {
      params: { page, limit }
    })
    return response.data
  }
}

export default new CourseAdminInstructorService()
