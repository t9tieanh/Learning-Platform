import { Router } from 'express'
import AiChatController from '~/controllers/aiChat.controller';
import authen from '~/middleware/authen.middleware'

const router = Router()

router.post('/conversation', authen, AiChatController.createConversation)
router.get('/conversation', authen, AiChatController.loadConversation)

// Generate AI reply and append to conversation
router.post('/chat', AiChatController.generateReply)

export default router
