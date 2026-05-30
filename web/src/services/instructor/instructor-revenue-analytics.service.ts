import axiosClient from '@/lib/axiosClient.lib'
import type { RevenueAnalytics } from '@/types/instructor-revenue-analytics.type'

class InstructorRevenueAnalyticsService {
  async getRevenueAnalytics(params: { instructorId: string; year: number }): Promise<RevenueAnalytics> {
    const { instructorId, year } = params
    const res = await axiosClient.axiosInstance.get('/learning/courses-instructor/analytics/revenue', {
      params: { instructorId, year }
    })

    return res.data?.result as RevenueAnalytics
  }
}

export const instructorRevenueAnalyticsService = new InstructorRevenueAnalyticsService()
export default instructorRevenueAnalyticsService
