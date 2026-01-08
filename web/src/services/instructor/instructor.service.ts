import axiosClient from '@/lib/axiosClient.lib'
import type { InstructorChart, InstructorStatistic } from '@/types/instructor.type'

class InstructorService {
  async getStatistic(userId: string): Promise<InstructorStatistic> {
    const res = await axiosClient.axiosInstance.get('/instructor/statistic', { params: { userId } })
    return res.data?.result as InstructorStatistic
  }

  async getChart(params: { year: number | string; userId: string }): Promise<InstructorChart> {
    const { year, userId } = params
    const res = await axiosClient.axiosInstance.get('/instructor/chart', { params: { year, userId } })
    return res.data?.result as InstructorChart
  }
}

export const instructorService = new InstructorService()
export default instructorService
