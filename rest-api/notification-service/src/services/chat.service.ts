import { Types } from 'mongoose'
import Conversation, { IConversation } from '~/models/message/conversation.model'
import Message, { IMessage } from '~/models/message/message.model'
import socket from '~/socket'
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
const createOrGetDirect = async (currentUserId: string, peerId: string, currentRole: string): Promise<DirectConversationResult> => {
    const me = (currentUserId)
    const peer = (peerId)

    const peerRole: 'student' | 'instructor' = currentRole === 'student' ? 'instructor' : 'student';

    const key = buildDirectKey(String(me), String(peer))

    let conv = await Conversation.findOne({ key })

    if (!conv) {
        conv = await Conversation.create({
            key,
            type: 'direct',
            participants: [
                { userId: me, role: currentRole },
                { userId: peer, role: peerRole },
            ],
        })
        return { conversation: conv, isNew: true }
    }

    return { conversation: conv, isNew: false }
}

// Danh sách hội thoại của user hiện tại (phân theo student và instructor)

const listConversations = async (currentUserId: string, currentRole: 'student' | 'instructor') => {
    const conversations = await Conversation.find({
        'participants.userId': currentUserId,
    })
        .sort({ lastMessageAt: -1 })
        .lean();

    const filtered = conversations.filter(conv => {
        const me = conv.participants.find(p => p.userId === currentUserId);
        const other = conv.participants.find(p => p.userId !== currentUserId);
        if (!me || !other) return false;

        if (currentRole === 'student') return other.role === 'instructor';
        if (currentRole === 'instructor') return other.role === 'student';
        return false;
    });

    return filtered;
}


// Lấy danh sách tin nhắn theo conversationId (cursor-based)
const getMessages = async (conversationId: string, cursor?: string, limit = 20) => {
    try {
        const convId = String(conversationId);

        // Validate conversationId
        if (!convId) {
            throw new Error('Thiếu conversationId');
        }

        const query: any = { conversationId: convId };

        // Phân trang nếu có cursor
        if (cursor) {
            if (Types.ObjectId.isValid(cursor)) {
                query._id = { $lt: new Types.ObjectId(cursor) };
            } else {
                console.warn('[getMessages] ⚠️ Cursor không hợp lệ:', cursor);
            }
        }

        const docs = await Message.find(query)
            .sort({ _id: -1 })
            .limit(limit + 1)
            .lean();

        const hasMore = docs.length > limit;
        const items = hasMore ? docs.slice(0, limit) : docs;
        const nextCursor = hasMore ? String(items[items.length - 1]._id) : null;

        return { items, hasMore, nextCursor };
    } catch (error) {
        console.error('[getMessages] ❌ Lỗi khi lấy tin nhắn:', error);
        return { items: [], hasMore: false, nextCursor: null, error: (error as Error).message };
    }
};

// Gửi tin nhắn trong hội thoại
const sendMessage = async (
    conversationId: string,
    senderId: string,
    senderRole: 'student' | 'instructor',
    content: string
): Promise<IMessage> => {
    try {
        const convId = (conversationId);
        const sender = (senderId);

        console.log({ conversationId, senderId, senderRole, content });

        const message = await Message.create({
            conversationId: convId,
            senderId: sender,
            senderRole,
            content,
            type: 'text',
            status: 'sent',
        });

        // cập nhật last message của conversation
        await Conversation.findByIdAndUpdate(convId, {
            lastMessageId: message._id,
            lastMessageAt: message.createdAt,
        });

        // socket.emit("receive_message", message);

        return message;
    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw new Error(`Không thể gửi tin nhắn: ${error instanceof Error ? error.message : String(error)}`);
    }
};


// Đánh dấu đã đọc tin nhắn (toàn bộ hoặc đến một messageId)
const markRead = async (conversationId: string, readerId: string, messageId?: string) => {
    const convId = (conversationId)

    const filter: any = { conversationId: convId, status: { $ne: 'read' } }
    if (messageId && Types.ObjectId.isValid(messageId)) {
        filter._id = { $lte: new Types.ObjectId(messageId) }
    }

    const result = await Message.updateMany(filter, { $set: { status: 'read' } })

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
