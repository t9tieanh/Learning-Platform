import { Router } from 'express'
import { ValidateDto } from '~/middleware'
import { GetFeedBackDTO } from '~/dto/request/feedback.dto'
import FeedbackController from '~/controllers/feedback.controller'

const router = Router()

router.get('/gets', ValidateDto(GetFeedBackDTO), FeedbackController.gets)

export default router
