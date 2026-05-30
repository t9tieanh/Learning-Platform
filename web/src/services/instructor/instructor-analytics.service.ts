import axiosClient from '@/lib/axiosClient.lib'
import type { LearnerAnalytics } from '@/types/instructor-analytics.type'

class InstructorAnalyticsService {
  async getLearnerAnalytics(params: { instructorId: string; year: number }): Promise<LearnerAnalytics> {
    const { instructorId, year } = params
    const res = await axiosClient.axiosInstance.get('/learning/courses-instructor/analytics/learners', {
      params: { instructorId, year }
    })
    return res.data?.result as LearnerAnalytics
  }
}

export const instructorAnalyticsService = new InstructorAnalyticsService()
export default instructorAnalyticsService
