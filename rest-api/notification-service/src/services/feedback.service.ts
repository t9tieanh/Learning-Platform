import { GetFeedBackDTO } from '~/dto/request/feedback.dto'
import { Feedback } from '~/models/review/feedback.model'
import { Types } from 'mongoose'
import { getUser } from '~/grpc/userClient'

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
      console.log(`Error fetching user info for userId=${item.userId}:`)
      item.userName = ''
      item.userAvatar = ''
    }
  }

  return { items, hasMore, nextCursor }
}
const FeedbackService = {
  gets
}

export default FeedbackService
