import { Router } from 'express'
import { ValidateDto } from '~/middleware'
import AiChatController from '~/controllers/aiChat.controller';

const router = Router()

router.post('/chat', AiChatController.generateReply)

export default router
