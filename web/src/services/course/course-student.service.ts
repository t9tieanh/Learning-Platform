import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'
import { CourseListResult } from '@/types/course-user'
import { CourseDetail } from '@/types/course-student'

class CourseStudentService {
  async getMyCourse(): Promise<ApiResponse<CourseListResult>> {
    const response = await axiosClient.axiosInstance.get(`learning/courses-student/self`)
    return response.data
  }

  async getCourseDetails(courseId: string): Promise<ApiResponse<CourseDetail>> {
    const response = await axiosClient.axiosInstance.get(`learning/courses-student/${courseId}`)
    return response.data
  }
}

export default new CourseStudentService()
