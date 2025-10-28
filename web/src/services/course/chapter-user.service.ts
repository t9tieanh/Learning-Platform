import { ApiResponse } from '@/types/response.type'
import axiosClient from '@/lib/axiosClient.lib'
import { CourseSection } from '@/types/course-user'

class ChapterUserService {
  async getChapterPublic(chapterId: string): Promise<ApiResponse<CourseSection>> {
    const response = await axiosClient.axiosInstance.get(`learning/chapters-user/${chapterId}/public`)
    return response.data
  }
}

export default new ChapterUserService()
