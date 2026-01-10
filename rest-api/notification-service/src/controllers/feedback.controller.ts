import { StatusCodes } from 'http-status-codes'
import sendResponse from '~/dto/response/send-response'
import FeedbackService from '~/services/feedback.service'
import { Request, Response } from 'express'
import { AddFeedBackDTO } from '~/dto/request/feedback.dto'
import ApiError from '~/middleware/ApiError'

interface FeedbackRequestContext {
  courseId?: string
}

const gets = async (req: Request & { data?: FeedbackRequestContext }, res: Response) => {
  try {
    const courseId = (req.query.courseId as string) || req.data?.courseId || ''
    const cursor = req.query.cursor ? String(req.query.cursor) : undefined
    const limit = req.query.limit ? Number(req.query.limit) : 10

    if (!courseId) throw new Error('courseId is required')

    const result = await FeedbackService.gets({ courseId, cursor, limit })

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy danh sách feedback thành công',
      result
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi lấy feedback',
      result: null
    })
  }
}

// add feedback controller
const addFeedback = async (req: Request, res: Response) => {
  try {
    const { rating, comment, courseId } = req.data as AddFeedBackDTO
    if (!req.user?.sub) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Ban cần đăng nhập để thêm feedback')

    const result = await FeedbackService.addFeedBack({
      userId: req.user?.sub,
      courseId,
      rating,
      message: comment as string
    })

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Thêm đánh giá cho khóa học thành công',
      result
    })
  } catch (e: any) {
    throw new ApiError(StatusCodes.BAD_REQUEST, e.message || 'Thêm đánh giá cho khóa học thất bại, xin vui lòng thử lại !')
  }
}

const getFeedbackByUserAndCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId
    if (!req.user?.sub) throw new ApiError(StatusCodes.UNAUTHORIZED, 'Bạn cần đăng nhập để xem đánh giá')

    const feedback = await FeedbackService.getFeedbackByUserIdAndCourseId(req.user.sub, courseId)

    sendResponse(res, {
      code: StatusCodes.OK,
      message: 'Lấy đánh giá thành công',
      result: feedback
    })
  } catch (e) {
    const err = e as Error
    sendResponse(res, {
      code: StatusCodes.BAD_REQUEST,
      message: err.message || 'Lỗi lấy đánh giá',
      result: null
    })
  }
}

const FeedbackController = {
  gets,
  addFeedback,
  getFeedbackByUserAndCourse
}

export default FeedbackController
