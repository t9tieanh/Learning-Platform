import { Router } from 'express'
import AiChatController from '~/controllers/aiChat.controller';

const router = Router()

router.post('/conversation', AiChatController.createConversation)
router.get('/conversation', AiChatController.loadConversation)
router.delete('/conversation', AiChatController.deleteConversation)

// Generate AI reply and append to conversation
router.post('/chat', AiChatController.generateReply)

export default router
