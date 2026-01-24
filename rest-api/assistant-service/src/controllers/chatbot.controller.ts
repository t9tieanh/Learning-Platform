import { Request, Response, NextFunction } from 'express';
import chatbotService from '~/service/models/chatbot.service';
import sendResponse from '~/dto/response/send-response';

class ChatbotController {
    async chat(req: Request, res: Response, next: NextFunction) {
        try {
            const { question } = req.data;
            // Prefer userId if logged in, otherwise use guestId from checkCookie middleware
            const userId = req.user?.sub || (req as any).guestId;

            const result = await chatbotService.sendMessage(question, userId);

            sendResponse(res, {
                code: 200,
                message: 'Success',
                result: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getHistory(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.sub || (req as any).guestId;
            const result = await chatbotService.getChatHistory(userId);

            sendResponse(res, {
                code: 200,
                message: 'Success',
                result: result
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new ChatbotController();
