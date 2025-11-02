import { Types } from 'mongoose'
import Conversation, { IConversation } from '~/models/message/conversation.model'
import Message, { IMessage } from '~/models/message/message.model'
import socketClient from '~/socket';
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


        return message;
    } catch (error) {
        console.error('Error in sendMessage:', error);
        throw new Error(`Không thể gửi tin nhắn: ${error instanceof Error ? error.message : String(error)}`);
    }
};


// Đánh dấu đã đọc tin nhắn (toàn bộ hoặc đến một messageId)
const markRead = async (conversationId: string, senderId: string, peerId: string, messageId?: string) => {
    try {
        console.log('READER ID', peerId);
        if (peerId) {
            const filter: any = { conversationId: conversationId, status: { $ne: 'read' } }
            // if (messageId && Types.ObjectId.isValid(messageId)) {
            //     filter._id = { $lte: new Types.ObjectId(messageId) }
            // }
            const result = await Message.updateMany(filter, { $set: { status: 'read' } })
            socketClient.emit("server_message_read", {
                conversationId,
                senderId,
                peerId
            });
            return { updated: result.modifiedCount }
        }
        return null;
    } catch (error) {
        console.error('❌ Error in markRead:', error);
        return null;
    }
}

const updateMessage = async (conversationId: string, messageId: string, senderId: string, content: string, peerId: string) => {
    try {
        console.log('conversationId', conversationId)
        console.log('messageId', messageId)
        console.log('senderId', senderId)
        console.log('content', content)

        const updated = await Message.findOneAndUpdate(
            { _id: messageId, conversationId: conversationId, senderId: senderId },
            { $set: { content } },
            { new: true }
        )

        if (!updated) {
            throw new Error('Không tìm thấy tin nhắn hoặc bạn không có quyền chỉnh sửa')
        }

        const conversation = await Conversation.findById(conversationId)
        if (!conversation) {
            throw new Error('Không tìm thấy cuộc trò chuyện')
        }

        const isLastMessage = conversation.lastMessageId?.toString() === messageId.toString()
        const senderRole = updated.senderRole
        console.log('isLastMessage', conversation.lastMessageId?.toString())
        console.log('messageId', messageId)
        if (isLastMessage) {
            await Conversation.findByIdAndUpdate(conversationId, {
                $set: { lastMessageAt: updated.createdAt, lastMessageId: updated._id }
            })
            socketClient.emit('server_last_message_update', {
                conversationId,
                messageId,
                content,
                senderId,
                peerId,
                senderRole,
            })
        }

        socketClient.emit('server_message_update', {
            conversationId,
            messageId,
            content,
            senderId,
            peerId,
            senderRole,
        })

        return updated
    } catch (err) {
        console.error('Lỗi khi cập nhật tin nhắn:', err);
        return null;
    }
}

const deleteMessage = async (conversationId: string, messageId: string, requesterId: string) => {
    try {
        const msg = await Message.findOne({
            _id: messageId,
            conversationId,
            senderId: requesterId,
        });
        if (!msg) {
            throw new Error("Không tìm thấy tin nhắn hoặc bạn không có quyền xóa");
        }

        await Message.deleteOne({ _id: messageId });

        const conv = await Conversation.findById(conversationId);

        const instructorId = conv?.participants?.find(
            (p) => p.role === "instructor"
        )?.userId;
        const studentId = conv?.participants?.find(
            (p) => p.role === "student"
        )?.userId;

        const isLast =
            conv && String(conv.lastMessageId) === String(messageId);

        if (isLast) {
            const last = await Message.find({ conversationId })
                .sort({ _id: -1 })
                .limit(1)
                .lean();

            const nextLast = last[0];

            const updateData: any = {};

            if (nextLast) {
                updateData.$set = {
                    lastMessageId: nextLast._id,
                    lastMessageAt: nextLast.createdAt,
                };
            } else {
                updateData.$unset = {
                    lastMessageId: 1,
                    lastMessageAt: 1,
                };
            }

            await Conversation.findByIdAndUpdate(conversationId, updateData);

            socketClient.emit("server_message_delete_last", {
                conversationId,
                deletedMessageId: messageId,
                newLastMessage: nextLast
                    ? {
                        id: nextLast._id,
                        content: nextLast.content,
                        createdAt: nextLast.createdAt,
                    }
                    : null,
                instructorId,
                studentId,
            });
        }

        socketClient.emit("server_message_delete", {
            conversationId,
            messageId,
            instructorId,
            studentId,
        });

        return { deleted: true };
    } catch (err) {
        console.error("Lỗi khi xóa tin nhắn:", err);
        return { deleted: false };
    }
};


const ChatService = {
    createOrGetDirect,
    listConversations,
    getMessages,
    sendMessage,
    markRead,
    updateMessage,
    deleteMessage
}

export default ChatService
