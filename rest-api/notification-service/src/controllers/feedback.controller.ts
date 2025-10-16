import { StatusCodes } from 'http-status-codes'
import sendResponse from '~/dto/response/send-response'
import FeedbackService from '~/services/feedback.service'
import { Request, Response } from 'express'

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

const FeedbackController = {
  gets
}

export default FeedbackController
