import express from 'express';
import chatbotController from '~/controllers/chatbot.controller';

import validateDto from '~/middleware/validateDto.midleware';
import { ChatbotRequest } from '~/dto/request/chatbot.dto';
import checkCookie from '~/middleware/checkCookie.midleware';

const router = express.Router();

router.use(checkCookie)
router.post('/chat-bot', validateDto(ChatbotRequest), chatbotController.chat);
router.get('/chat-history', chatbotController.getHistory);

export default router;
