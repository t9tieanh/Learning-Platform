import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import AiChatService from '~/services/aiChat.service';

const generateReply = async (req: Request, res: Response) => {
    const { message } = req.body || {};
    console.log('MESSAGE', message)
    if (typeof message !== 'string' || !message.trim()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing or invalid "message" in body' });
    }

    try {
        const reply = await AiChatService.generateReply(message.trim());
        res.json({ reply });
    } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message || 'Internal Server Error' });
    }
}

const AiChatController = {
    generateReply
}

export default AiChatController
