import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import sendResponse from '~/dto/response/send-response'
import ChatService from '~/services/chat.service'
import { getUser } from '~/grpc/userClient'
import Message from '~/models/message/message.model'

// Lưu ý: req.user được gán từ middleware authenticate (JWT)

const createOrGetDirect = async (req: Request, res: Response) => {
    try {
        // console.log('req', req)
        const currentUserId = (req.user as any)?.sub as string
        const { peerId } = req.body as { peerId: string }

        if (!currentUserId) throw new Error('Thiếu thông tin người dùng (token)')

        const result = await ChatService.createOrGetDirect(currentUserId, peerId)

        sendResponse(res, {
            code: StatusCodes.OK,
            message: result.isNew ? 'Tạo cuộc trò chuyện mới thành công' : 'Lấy cuộc trò chuyện thành công',
            result: {
                conversationId: String(result.conversation._id),
                key: result.conversation.key,
                isNew: result.isNew
            }
        })
    } catch (e) {
        const err = e as Error
        sendResponse(res, {
            code: StatusCodes.BAD_REQUEST,
            message: err.message || 'Lỗi tạo/lấy cuộc trò chuyện',
            result: null
        })
    }
}

const listConversations = async (req: Request, res: Response) => {
    try {
        const currentUserId = (req.user as any)?.sub as string
        if (!currentUserId) throw new Error('Thiếu thông tin người dùng (token)')

        const conversations = await ChatService.listConversations(currentUserId)

        // Map thêm thông tin peer + last message + unread count
        const me = String(currentUserId)

        const enriched = await Promise.all(
            conversations.map(async (c) => {
                const peerId = c.participants.map(String).find((id) => id !== me) || me

                // Lấy last message nếu có
                let lastMessage: any = null
                if (c.lastMessageId) {
                    const m = await Message.findById(c.lastMessageId).lean()
                    if (m) {
                        lastMessage = {
                            _id: String(m._id),
                            content: m.content || '',
                            senderId: String(m.senderId),
                            senderRole: m.senderRole,
                            createdAt: m.createdAt
                        }
                    }
                }

                // Đếm tin nhắn chưa đọc
                const unreadCount = await Message.countDocuments({
                    conversationId: c._id,
                    readBy: { $ne: currentUserId },
                    senderId: { $ne: currentUserId }
                })

                // Gọi gRPC lấy thông tin peer
                let peerName = ''
                let peerAvatar = ''
                try {
                    const user = await getUser(peerId)
                    peerName = user.name || ''
                    peerAvatar = user.image || ''
                } catch {
                    // ignore
                }

                return {
                    conversationId: String(c._id),
                    key: c.key,
                    peerId,
                    peerName,
                    peerAvatar,
                    lastMessage,
                    unreadCount,
                    lastMessageAt: c.lastMessageAt || c.updatedAt
                }
            })
        )

        sendResponse(res, {
            code: StatusCodes.OK,
            message: 'Lấy danh sách cuộc trò chuyện thành công',
            result: enriched
        })
    } catch (e) {
        const err = e as Error
        sendResponse(res, {
            code: StatusCodes.BAD_REQUEST,
            message: err.message || 'Lỗi lấy danh sách cuộc trò chuyện',
            result: null
        })
    }
}

const getMessages = async (req: Request, res: Response) => {
    try {
        const { conversationId, cursor, limit } = req.data as {
            conversationId: string
            cursor?: string
            limit?: number
        }

        const result = await ChatService.getMessages(conversationId, cursor, limit)

        sendResponse(res, {
            code: StatusCodes.OK,
            message: 'Lấy lịch sử tin nhắn thành công',
            result
        })
    } catch (e) {
        const err = e as Error
        sendResponse(res, {
            code: StatusCodes.BAD_REQUEST,
            message: err.message || 'Lỗi lấy tin nhắn',
            result: null
        })
    }
}

const sendMessage = async (req: Request, res: Response) => {
    try {
        const currentUserId = (req.user as any)?.sub as string
        if (!currentUserId) throw new Error('Thiếu thông tin người dùng (token)')

        console.log('[REQ DATA]', req.data)
        const { conversationId, content, senderRole } = req.data as {
            conversationId: string
            content: string
            senderRole: 'student' | 'instructor'
        }

        console.log('conversationId:', conversationId);
        console.log('currentUserId:', currentUserId);
        console.log('senderRole:', senderRole);
        console.log('content:', content);

        const message = await ChatService.sendMessage(conversationId, currentUserId, senderRole, content)

        sendResponse(res, {
            code: StatusCodes.CREATED,
            message: 'Gửi tin nhắn thành công',
            result: {
                _id: String(message._id),
                conversationId: String(message.conversationId),
                senderId: String(message.senderId),
                senderRole: message.senderRole,
                content: message.content || '',
                type: message.type,
                status: message.status,
                createdAt: message.createdAt
            }
        })
    } catch (e) {
        const err = e as Error
        sendResponse(res, {
            code: StatusCodes.BAD_REQUEST,
            message: err.message || 'Lỗi gửi tin nhắn',
            result: null
        })
    }
}

const markRead = async (req: Request, res: Response) => {
    try {
        const currentUserId = (req.user as any)?.userId as string
        if (!currentUserId) throw new Error('Thiếu thông tin người dùng (token)')

        const { conversationId, messageId } = req.data as { conversationId: string; messageId?: string }

        const result = await ChatService.markRead(conversationId, currentUserId, messageId)

        sendResponse(res, {
            code: StatusCodes.OK,
            message: 'Đánh dấu đã đọc thành công',
            result
        })
    } catch (e) {
        const err = e as Error
        sendResponse(res, {
            code: StatusCodes.BAD_REQUEST,
            message: err.message || 'Lỗi đánh dấu đã đọc',
            result: null
        })
    }
}

const ChatController = {
    createOrGetDirect,
    listConversations,
    getMessages,
    sendMessage,
    markRead
}

export default ChatController
