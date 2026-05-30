import axiosClient from '@/lib/axiosClient.lib'
import type { InstructorFeedbackOverview } from '@/types/instructor-feedback-analytics.type'

class InstructorFeedbackAnalyticsService {
  async getInstructorFeedbackOverview(params: {
    instructorId: string
    limit?: number
  }): Promise<InstructorFeedbackOverview> {
    const { instructorId, limit = 10 } = params
    const res = await axiosClient.axiosInstance.get('/notify/feedback/v2/instructor-overview', {
      params: { instructorId, limit }
    })

    return res.data?.result as InstructorFeedbackOverview
  }
}

export const instructorFeedbackAnalyticsService = new InstructorFeedbackAnalyticsService()
export default instructorFeedbackAnalyticsService
