import { Router } from 'express'
import { ValidateDto } from '~/middleware'
import { AddFeedBackDTO, GetFeedBackDTO } from '~/dto/request/feedback.dto'
import FeedbackController from '~/controllers/feedback.controller'
import authenticate from '~/middleware/authen.middleware'

const router = Router()

router.get('/gets', ValidateDto(GetFeedBackDTO), FeedbackController.gets)

router.use(authenticate)
router.post('/', ValidateDto(AddFeedBackDTO), FeedbackController.addFeedback)
router.get('/course/:courseId', FeedbackController.getFeedbackByUserAndCourse)

export default router
