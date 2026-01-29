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
      { $set: { rating, message, updatedAt: new Date() } }
    )
  } else {
    // insert new feedback
    await Feedback.create({
      userId,
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
  addFeedBack,
  getFeedbackByCourseId,
  getFeedbackByUserIdAndCourseId
}

export default FeedbackService
