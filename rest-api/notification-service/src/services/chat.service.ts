import { Types } from 'mongoose'
import Conversation, { IConversation } from '~/models/message/conversation.model'
import Message, { IMessage } from '~/models/message/message.model'

interface DirectConversationResult {
    conversation: IConversation
    isNew: boolean
}

const ensureObjectId = (id: string): Types.ObjectId => {
    if (!Types.ObjectId.isValid(id)) {
        throw new Error('Id không hợp lệ')
    }
    return new Types.ObjectId(id)
}

// Chuẩn hoá key dm:userA:userB (sort để tránh trùng lặp)
const buildDirectKey = (a: string, b: string) => {
    const [x, y] = [a, b].sort()
    return `dm:${x}:${y}`
}

// Tạo hoặc lấy cuộc trò chuyện 1-1
const createOrGetDirect = async (currentUserId: string, peerId: string): Promise<DirectConversationResult> => {
    const me = (currentUserId)
    const peer = (peerId)

    const key = buildDirectKey(String(me), String(peer))

    let conv = await Conversation.findOne({ key })

    if (!conv) {
        conv = await Conversation.create({
            key,
            type: 'direct',
            participants: [me, peer]
        })
        return { conversation: conv, isNew: true }
    }

    return { conversation: conv, isNew: false }
}

// Danh sách hội thoại của user hiện tại
const listConversations = async (currentUserId: string) => {
    const me = (currentUserId)

    const conversations = await Conversation.find({ participants: me })
        .sort({ lastMessageAt: -1, updatedAt: -1 })
        .lean()

    return conversations
}

// Lấy danh sách tin nhắn theo conversationId (cursor-based)
const getMessages = async (conversationId: string, cursor?: string, limit = 20) => {
    const convId = ensureObjectId(conversationId)

    const query: any = { conversationId: convId }

    if (cursor && Types.ObjectId.isValid(cursor)) {
        query._id = { $lt: new Types.ObjectId(cursor) }
    }

    const docs = await Message.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .lean()

    const hasMore = docs.length > limit
    const items = hasMore ? docs.slice(0, limit) : docs
    const nextCursor = hasMore ? String(items[items.length - 1]._id) : null

    return { items, hasMore, nextCursor }
}

// Gửi tin nhắn trong hội thoại
const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderRole: 'student' | 'instructor',
    content: string
): Promise<IMessage> => {
    const convId = ensureObjectId(conversationId)
    const sender = ensureObjectId(senderId)

    const message = await Message.create({
        conversationId: convId,
        senderId: sender,
        senderRole,
        content,
        type: 'text',
        status: 'sent'
    })

    // cập nhật last message của conversation
    await Conversation.findByIdAndUpdate(convId, {
        lastMessageId: message._id,
        lastMessageAt: message.createdAt
    })

    return message
}

// Đánh dấu đã đọc tin nhắn (toàn bộ hoặc đến một messageId)
const markRead = async (conversationId: string, readerId: string, messageId?: string) => {
    const convId = ensureObjectId(conversationId)
    const reader = ensureObjectId(readerId)

    const filter: any = { conversationId: convId, readBy: { $ne: reader } }
    if (messageId && Types.ObjectId.isValid(messageId)) {
        filter._id = { $lte: new Types.ObjectId(messageId) }
    }

    const result = await Message.updateMany(filter, { $addToSet: { readBy: reader } })

    return { updated: result.modifiedCount }
}

const ChatService = {
    createOrGetDirect,
    listConversations,
    getMessages,
    sendMessage,
    markRead
}

export default ChatService
