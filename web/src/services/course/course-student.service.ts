import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'
import { CourseListResult } from '@/types/course-user'
import { CourseDetail } from '@/types/course-student'

class CourseStudentService {
  async getMyCourse(page = 0, size = 10): Promise<ApiResponse<CourseListResult>> {
    const response = await axiosClient.axiosInstance.get(`learning/courses-student/self`, {
      params: { page, size }
    })
    return response.data
  }

  async getCourseDetails(courseId: string): Promise<ApiResponse<CourseDetail>> {
    const response = await axiosClient.axiosInstance.get(`learning/courses-student/${courseId}`)
    return response.data
  }
}

export default new CourseStudentService()
