import { StatusCodes } from 'http-status-codes'
import { Request, Response } from 'express'
import AiChatService from '~/services/aiChat.service';
import { Types } from 'mongoose';

const generateReply = async (req: Request, res: Response) => {
    const { message, conversationId, userId } = req.body || {};

    if (!userId || typeof userId !== 'string') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Missing user context' });
    }

    if (typeof message !== 'string' || !message.trim()) {
        return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Missing or invalid "message" in body' });
    }

    // Validate optional conversationId format
    let convId: string | undefined = undefined;
    if (conversationId) {
        if (typeof conversationId === 'string' && Types.ObjectId.isValid(conversationId)) {
            convId = conversationId;
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid conversationId' });
        }
    }

    try {
        const trimmed = message.trim();
        const reply = await AiChatService.generateReply(trimmed, userId);
        const conversation = await AiChatService.saveChat({
            userId,
            userMessage: trimmed,
            aiReply: reply,
            conversationId: convId
        });
        res.json({ reply, conversationId: conversation.id });
    } catch (err: any) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message || 'Internal Server Error' });
    }
}

const createConversation = async (req: Request, res: Response) => {
    const userId: string | undefined = (req as any).user?.id || req.body?.userId;
    if (!userId || typeof userId !== 'string') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Missing user context' });
    }
    try {
        const conversation = await AiChatService.createConversation(userId);
        return res.json({ conversationId: conversation.id, messages: conversation.messages });
    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message || 'Internal Server Error' });
    }
};

const loadConversation = async (req: Request, res: Response) => {
    const userId: string | undefined = (req as any).user?.id || (req.query?.userId as string | undefined);
    const conversationId: string | undefined = (req.query?.conversationId as string | undefined);

    if (!userId || typeof userId !== 'string') {
        return res.status(StatusCodes.UNAUTHORIZED).json({ error: 'Missing user context' });
    }

    let convId: string | undefined = undefined;
    if (conversationId) {
        if (typeof conversationId === 'string' && Types.ObjectId.isValid(conversationId)) {
            convId = conversationId;
        } else {
            return res.status(StatusCodes.BAD_REQUEST).json({ error: 'Invalid conversationId' });
        }
    }

    try {
        const conversation = await AiChatService.getConversation(userId, convId);
        if (!conversation) {
            return res.status(StatusCodes.NOT_FOUND).json({ error: 'Conversation not found' });
        }
        return res.json({ conversationId: conversation.id, messages: conversation.messages });
    } catch (err: any) {
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error: err.message || 'Internal Server Error' });
    }
};

const AiChatController = {
    generateReply,
    createConversation,
    loadConversation,
}

export default AiChatController
