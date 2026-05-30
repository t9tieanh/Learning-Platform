import { GetFeedBackDTO } from '~/dto/request/feedback.dto'
import { Feedback } from '~/models/review/feedback.model'
import { Types } from 'mongoose'
import { getUser } from '~/grpc/userClient'
import courseClient from '~/grpc/courseClient'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/middleware/ApiError'
import { FeedbackDto } from '~/dto/request/feedback.dto'
import Logger from '~/utils/logger'

interface LeanFeedback {
  _id: Types.ObjectId
  userId: string
  instructorId?: string
  courseId: string
  rating: number
  message: string
  createdAt: Date
  updatedAt: Date

  // gRPC name & avatar by userId
  userName?: string
  userAvatar?: string
}

interface Feedback {
  userId: string
  instructorId?: string
  courseId: string
  rating: number
  message: string
  createdAt: Date
  updatedAt: Date

  // gRPC name & avatar by userId
  userName?: string
  userAvatar?: string
}

interface FeedbackListResult {
  items: LeanFeedback[]
  hasMore: boolean
  nextCursor: string | null
}

interface InstructorFeedbackOverviewResult {
  feedbackMetrics: {
    averageRating: number
    totalReviews: number
    trend: { value: number; positive: boolean }
  }
  sentimentSummary: {
    positive: number
    neutral: number
    negative: number
  }
  recentReviews: Array<{
    id: string
    userId: string
    rating: number
    comment: string
    date: string
    user: string
    userAvatar: string
  }>
}

const gets = async (request: GetFeedBackDTO): Promise<FeedbackListResult> => {
  const { courseId, cursor, limit = 10 } = request
  if (!courseId) throw new Error('courseId is required')

  const query: any = { courseId }

  if (cursor && Types.ObjectId.isValid(cursor)) {
    query._id = { $lt: new Types.ObjectId(cursor) }
  }

  const docs = await Feedback.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean()

  const hasMore = docs.length > limit
  const items = (hasMore ? docs.slice(0, limit) : docs) as unknown as LeanFeedback[]
  const nextCursor = hasMore ? String(items[items.length - 1]._id) : null

  for (const item of items) {
    try {
      const user = await getUser(item.userId)
      item.userName = user.name || ''
      item.userAvatar = user.image || ''
    } catch (err) {
      Logger.error(`Error fetching user info for userId=${item.userId}: ${err}`)
      item.userName = ''
      item.userAvatar = ''
    }
  }

  return { items, hasMore, nextCursor }
}

const getInstructorOverview = async (request: {
  instructorId: string
  limit?: number
}): Promise<InstructorFeedbackOverviewResult> => {
  const instructorId = String(request.instructorId || '').trim()
  const limit = Math.min(Math.max(Number(request.limit || 10), 1), 50)

  if (!instructorId) throw new Error('instructorId is required')

  const [summaryAgg, recentDocs] = await Promise.all([
    Feedback.aggregate([
      { $match: { instructorId } },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: '$rating' },
          positiveCount: {
            $sum: { $cond: [{ $gte: ['$rating', 4] }, 1, 0] }
          },
          neutralCount: {
            $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] }
          },
          negativeCount: {
            $sum: { $cond: [{ $lte: ['$rating', 2] }, 1, 0] }
          }
        }
      }
    ]),
    Feedback.find(
      { instructorId },
      { _id: 1, userId: 1, rating: 1, message: 1, createdAt: 1 }
    )
      .sort({ createdAt: -1, _id: -1 })
      .limit(limit)
      .lean()
  ])

  const summary = summaryAgg[0]
  const totalReviews = summary?.totalReviews ?? 0
  const averageRating = totalReviews > 0 ? Number((summary.averageRating ?? 0).toFixed(1)) : 0
  const positiveCount = summary?.positiveCount ?? 0
  const neutralCount = summary?.neutralCount ?? 0
  const negativeCount = summary?.negativeCount ?? 0

  const toPercent = (count: number) => {
    if (!totalReviews) return 0
    return Math.round((count / totalReviews) * 100)
  }

  const uniqueUserIds = Array.from(new Set(recentDocs.map((item: any) => item.userId).filter(Boolean)))
  const userMap = new Map<string, { name: string; image: string }>()
  await Promise.all(
    uniqueUserIds.map(async (uid) => {
      try {
        const user = await getUser(uid)
        userMap.set(uid, { name: user.name || '', image: user.image || '' })
      } catch (err) {
        Logger.error(`Error fetching user info for userId=${uid}: ${err}`)
      }
    })
  )

  return {
    feedbackMetrics: {
      averageRating,
      totalReviews,
      trend: { value: 0, positive: true }
    },
    sentimentSummary: {
      positive: toPercent(positiveCount),
      neutral: toPercent(neutralCount),
      negative: toPercent(negativeCount)
    },
    recentReviews: recentDocs.map((item: any) => ({
      id: String(item._id),
      userId: item.userId,
      rating: item.rating,
      comment: item.message,
      date: item.createdAt instanceof Date ? item.createdAt.toISOString() : new Date(item.createdAt).toISOString(),
      user: userMap.get(item.userId)?.name || 'Học viên',
      userAvatar: userMap.get(item.userId)?.image || ''
    }))
  }
}

// Get feedbacks by courseId
const getFeedbackByCourseId = async (courseId: string): Promise<FeedbackDto[]> => {
  const feedbacks = await Feedback.find({ courseId }).lean()
  const result: FeedbackDto[] = []

  //get user info for each feedback
  for (const feedback of feedbacks) {
    try {
      const user = await getUser(feedback.userId)
        ; (feedback as any).userName = user.name || ''
        ; (feedback as any).userAvatar = user.image || ''
      feedback.id = String(feedback._id)
      result.push({
        id: feedback.id,
        userId: feedback.userId,
        courseId: feedback.courseId,
        rating: feedback.rating,
        message: feedback.message,
        userName: (feedback as any).userName,
        userAvatar: (feedback as any).userAvatar
      } as FeedbackDto)
    } catch (err) {
      Logger.error(`Error fetching user info for userId=${feedback.userId}: ${err}`)
        ; (feedback as any).userName = ''
        ; (feedback as any).userAvatar = ''
    }
  }
  return result
}

// Add feedback for a course
const addFeedBack = async (request: {
  userId: string
  courseId: string
  rating: number
  message: string
}): Promise<{
  message: string
}> => {

  const { userId, courseId, rating, message } = request
  const courseInfo = await courseClient.getCourse(courseId)
  const instructorId = String(courseInfo?.instructor?.id ?? '')

  //check course exists and user has purchased the course
  const hasPurchased = await courseClient.checkHasPurchased(courseId, userId)
  if (!hasPurchased) {
    throw new ApiError(StatusCodes.OK, 'Bạn chỉ có thể đánh giá khóa học đã mua !')
  }

  // check existing feedback by the same user for the course
  const existing = await Feedback.findOne({ userId, courseId })

  if (existing) {
    // update existing feedback
    await Feedback.updateOne(
      { _id: existing._id },
      { $set: { rating, message, instructorId, updatedAt: new Date() } }
    )
  } else {
    // insert new feedback
    await Feedback.create({
      userId,
      instructorId,
      courseId,
      rating,
      message
    })
  }

  // compute average rating for the course
  const agg = await Feedback.aggregate([
    { $match: { courseId } },
    { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
  ])
  const avgRating = agg.length ? agg[0].avgRating : rating

  // call external gRPC after DB transaction committed
  if (avgRating !== null) {
    try {
      await courseClient.updateCourseRating(courseId, avgRating)
    } catch (err) {
      // Log and continue — consider retrying via job/queue if this must succeed
      Logger.error(`Failed to update course rating via gRPC: ${err}`)
    }
  }

  return {
    message: 'Thêm Feedback cho khóa học thành công !'
  }
}

const getFeedbackByUserIdAndCourseId = async (userId: string, courseId: string): Promise<Feedback | null> => {
  const feedback = await Feedback.findOne({ userId, courseId }).lean()
  return feedback
}

const FeedbackService = {
  gets,
  getInstructorOverview,
  addFeedBack,
  getFeedbackByCourseId,
  getFeedbackByUserIdAndCourseId
}

export default FeedbackService
