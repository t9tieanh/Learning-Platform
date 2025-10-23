import axiosClient from '@/lib/axiosClient.lib'

export interface FeedbackItem {
  _id: string
  userId: string
  courseId: string
  rating: number
  message: string
  createdAt: string
  updatedAt: string
  userName?: string
  userAvatar?: string
}

export interface FeedbackListResponse {
  items: FeedbackItem[]
  hasMore: boolean
  nextCursor: string | null
}

async function getCourseFeedbacks(params: { courseId: string; limit?: number; cursor?: string }) {
  const { courseId, limit = 5, cursor } = params
  const query = new URLSearchParams({ courseId, limit: String(limit) })
  if (cursor) query.append('cursor', cursor)
  const res = await axiosClient.axiosInstance.get(`/notify/feedback/gets?${query.toString()}`)
  return res.data.result as FeedbackListResponse
}

export const feedbackService = { getCourseFeedbacks }

export default feedbackService
