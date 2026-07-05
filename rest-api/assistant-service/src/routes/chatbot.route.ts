import express from 'express';
import chatbotController from '~/controllers/chatbot.controller';

import validateDto from '~/middleware/validateDto.midleware';
import { ChatbotRequest } from '~/dto/request/chatbot.dto';
import checkCookie from '~/middleware/checkCookie.midleware';
import chatRateLimit from '~/middleware/chatRateLimit.middleware';

const router = express.Router();

router.use(checkCookie)
router.post('/chat-bot', validateDto(ChatbotRequest), chatRateLimit(), chatbotController.chat);
router.get('/chat-history', chatbotController.getHistory);

export default router;
