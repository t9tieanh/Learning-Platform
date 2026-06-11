import { Types } from 'mongoose'
import Conversation, { IConversation } from '~/models/message/conversation.model'
import Message, { IMessage } from '~/models/message/message.model'
import { Feedback } from '~/models/review/feedback.model'
import courseClient from '~/grpc/courseClient'
import socketClient from '~/socket'
import Logger from '~/utils/logger'
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
const createOrGetDirect = async (
  currentUserId: string,
  peerId: string,
  currentRole: string
): Promise<DirectConversationResult> => {
  const me = currentUserId
  const peer = peerId

  const peerRole: 'student' | 'instructor' = currentRole === 'student' ? 'instructor' : 'student'

  const key = buildDirectKey(String(me), String(peer))

  let conv = await Conversation.findOne({ key })

  if (!conv) {
    conv = await Conversation.create({
      key,
      type: 'direct',
      participants: [
        { userId: me, role: currentRole },
        { userId: peer, role: peerRole }
      ]
    })
    return { conversation: conv, isNew: true }
  }

  return { conversation: conv, isNew: false }
}

// Danh sách hội thoại của user hiện tại (phân theo student và instructor)

const listConversations = async (currentUserId: string, currentRole: 'student' | 'instructor') => {
  const conversations = await Conversation.find({
    'participants.userId': currentUserId
  })
    .sort({ lastMessageAt: -1 })
    .lean()

  const filtered = conversations.filter((conv) => {
    const me = conv.participants.find((p) => p.userId === currentUserId)
    const other = conv.participants.find((p) => p.userId !== currentUserId)
    if (!me || !other) return false

    if (currentRole === 'student') return other.role === 'instructor'
    if (currentRole === 'instructor') return other.role === 'student'
    return false
  })

  return filtered
}

// Lấy danh sách tin nhắn theo conversationId (cursor-based)
const getMessages = async (conversationId: string, cursor?: string, limit = 20) => {
  try {
    const convId = String(conversationId)

    // Validate conversationId
    if (!convId) {
      throw new Error('Thiếu conversationId')
    }

    const query: any = { conversationId: convId }

    // Phân trang nếu có cursor
    if (cursor) {
      if (Types.ObjectId.isValid(cursor)) {
        query._id = { $lt: new Types.ObjectId(cursor) }
      } else {
        Logger.warn(`[getMessages] ⚠️ Cursor không hợp lệ: ${cursor}`)
      }
    }

    const docs = await Message.find(query)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean()

    const hasMore = docs.length > limit
    const items = hasMore ? docs.slice(0, limit) : docs
    const nextCursor = hasMore ? String(items[items.length - 1]._id) : null

    return { items, hasMore, nextCursor }
  } catch (error) {
    Logger.error(`[getMessages] ❌ Lỗi khi lấy tin nhắn: ${error}`)
    return { items: [], hasMore: false, nextCursor: null, error: (error as Error).message }
  }
}

const getConversationParticipantContext = async (conversationId: string, currentUserId: string) => {
  const conversation = await Conversation.findById(conversationId)

  if (!conversation) {
    throw new Error('Không tìm thấy cuộc trò chuyện')
  }

  const sender = conversation.participants.find((p) => p.userId === currentUserId)
  const peer = conversation.participants.find((p) => p.userId !== currentUserId)

  if (!sender || !peer) {
    throw new Error('Bạn không thuộc cuộc trò chuyện này')
  }

  return {
    conversation,
    senderRole: sender.role,
    peerId: peer.userId
  }
}

// Gửi tin nhắn trong hội thoại
const sendMessage = async (conversationId: string, senderId: string, content: string): Promise<IMessage> => {
  try {
    const { senderRole, peerId } = await getConversationParticipantContext(conversationId, senderId)

    Logger.info(JSON.stringify({ conversationId, senderId, senderRole, peerId, content }))

    const message = await Message.create({
      conversationId: conversationId,
      senderId: senderId,
      senderRole,
      content,
      type: 'text',
      status: 'sent'
    })

    // cập nhật last message của conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessageId: message._id,
      lastMessageAt: message.createdAt
    })

    const messageId = message.id
    Logger.info(`messageId ${messageId}`)
    socketClient.emit('server_message_send', {
      conversationId,
      messageId,
      content,
      senderId,
      peerId,
      senderRole
    })

    return message
  } catch (error) {
    Logger.error(`Error in sendMessage: ${error}`)
    throw new Error(`Không thể gửi tin nhắn: ${error instanceof Error ? error.message : String(error)}`)
  }
}

// Đánh dấu đã đọc tin nhắn (toàn bộ hoặc đến một messageId)
const markRead = async (conversationId: string, senderId: string, peerId: string, messageId?: string) => {
  try {
    Logger.info(`READER ID ${peerId}`)
    if (peerId) {
      const filter: any = { conversationId: conversationId, status: { $ne: 'read' } }
      // if (messageId && Types.ObjectId.isValid(messageId)) {
      //     filter._id = { $lte: new Types.ObjectId(messageId) }
      // }
      const result = await Message.updateMany(filter, { $set: { status: 'read' } })
      socketClient.emit('server_message_read', {
        conversationId,
        senderId,
        peerId
      })
      return { updated: result.modifiedCount }
    }
    return null
  } catch (error) {
    Logger.error(`❌ Error in markRead: ${error}`)
    return null
  }
}

const updateMessage = async (
  conversationId: string,
  messageId: string,
  senderId: string,
  content: string,
  peerId: string
) => {
  try {
    Logger.info(`conversationId ${conversationId}`)
    Logger.info(`messageId ${messageId}`)
    Logger.info(`senderId ${senderId}`)
    Logger.info(`content ${content}`)

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
    Logger.info(`isLastMessage ${conversation.lastMessageId?.toString()}`)
    Logger.info(`messageId ${messageId}`)
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
        senderRole
      })
    }

    socketClient.emit('server_message_update', {
      conversationId,
      messageId,
      content,
      senderId,
      peerId,
      senderRole
    })

    return updated
  } catch (err) {
    Logger.error(`Lỗi khi cập nhật tin nhắn: ${err}`)
    return null
  }
}

const deleteMessage = async (conversationId: string, messageId: string, requesterId: string) => {
  try {
    const msg = await Message.findOne({
      _id: messageId,
      conversationId,
      senderId: requesterId
    })
    if (!msg) {
      throw new Error('Không tìm thấy tin nhắn hoặc bạn không có quyền xóa')
    }

    await Message.deleteOne({ _id: messageId })

    const conv = await Conversation.findById(conversationId)

    const instructorId = conv?.participants?.find((p) => p.role === 'instructor')?.userId
    const studentId = conv?.participants?.find((p) => p.role === 'student')?.userId

    const isLast = conv && String(conv.lastMessageId) === String(messageId)

    if (isLast) {
      const last = await Message.find({ conversationId }).sort({ _id: -1 }).limit(1).lean()

      const nextLast = last[0]

      const updateData: any = {}

      if (nextLast) {
        updateData.$set = {
          lastMessageId: nextLast._id,
          lastMessageAt: nextLast.createdAt
        }
      } else {
        updateData.$unset = {
          lastMessageId: 1,
          lastMessageAt: 1
        }
      }

      await Conversation.findByIdAndUpdate(conversationId, updateData)

      socketClient.emit('server_message_delete_last', {
        conversationId,
        deletedMessageId: messageId,
        newLastMessage: nextLast
          ? {
            id: nextLast._id,
            content: nextLast.content,
            createdAt: nextLast.createdAt
          }
          : null,
        instructorId,
        studentId
      })
    }

    socketClient.emit('server_message_delete', {
      conversationId,
      messageId,
      instructorId,
      studentId
    })

    return { deleted: true }
  } catch (err) {
    Logger.error(`Lỗi khi xóa tin nhắn: ${err}`)
    return { deleted: false }
  }
}

interface SendFirstMessageParams {
  courseId: string
  courseName: string
  studentId: string
  instructorIdHint?: string
}

const resolveInstructorId = async (courseId: string, instructorIdHint?: string) => {
  const course = await courseClient.getCourse(courseId)
  const instructorId = course.instructor?.id?.trim()
  const normalizedInstructorIdHint = instructorIdHint?.trim()

  if (!instructorId) {
    throw new Error(`Không tìm thấy instructor cho course ${courseId}`)
  }

  if (normalizedInstructorIdHint && normalizedInstructorIdHint !== instructorId) {
    Logger.warn(
      `[sendFirstMessage] instructor_id payload mismatch for course ${courseId}: payload=${normalizedInstructorIdHint}, courseService=${instructorId}`
    )
  }

  return instructorId
}

const sendFirstMessage = async ({ courseId, courseName, studentId, instructorIdHint }: SendFirstMessageParams) => {
  try {
    const normalizedCourseId = courseId?.trim()
    const normalizedStudentId = studentId?.trim()

    if (!normalizedCourseId) {
      throw new Error('Thiếu courseId khi gửi tin nhắn chào mừng')
    }

    if (!normalizedStudentId) {
      throw new Error(`Thiếu studentId khi gửi tin nhắn chào mừng cho course ${normalizedCourseId}`)
    }

    const instructorId = await resolveInstructorId(normalizedCourseId, instructorIdHint)

    if (instructorId === normalizedStudentId) {
      throw new Error(`InstructorId trùng StudentId (${normalizedStudentId}) cho course ${normalizedCourseId}`)
    }

    const { conversation } = await createOrGetDirect(normalizedStudentId, instructorId, 'student')
    const hasStudentParticipant = conversation.participants.some(
      (p) => p.userId === normalizedStudentId && p.role === 'student'
    )
    const hasInstructorParticipant = conversation.participants.some(
      (p) => p.userId === instructorId && p.role === 'instructor'
    )

    if (!hasStudentParticipant || !hasInstructorParticipant) {
      throw new Error(
        `Conversation ${conversation._id} sai participants cho welcome message: student=${normalizedStudentId}, instructor=${instructorId}`
      )
    }

    const welcomeMessage = `Xin chào! 👋 Chào mừng bạn đến với khóa học "${courseName}" 🎓 — chúc bạn có một hành trình học tập thật tuyệt vời! 🚀 Nếu có bất kỳ thắc mắc nào, đừng ngần ngại đặt câu hỏi nhé 💬`

    const message = await Message.create({
      conversationId: conversation._id,
      senderId: instructorId,
      senderRole: 'instructor',
      content: welcomeMessage,
      type: 'text',
      status: 'sent'
    })

    await Conversation.findByIdAndUpdate(conversation._id, {
      lastMessageAt: message.createdAt,
      lastMessageId: message._id
    })

    socketClient.emit('server_message_send', {
      conversationId: conversation._id,
      messageId: message._id,
      content: welcomeMessage,
      senderId: instructorId,
      peerId: normalizedStudentId,
      senderRole: 'instructor'
    })
  } catch (error) {
    Logger.error(`❌ Lỗi khi gửi tin nhắn chào mừng: ${error}`)
  }
}

const getFeedbackByCourseId = async (id: string[]) => {
  try {
    const feedback = await Feedback.find({ courseId: { $in: id } })
    return feedback
  } catch (error) {
    throw new Error('Lỗi khi lấy feedback')
  }
}

const ChatService = {
  createOrGetDirect,
  listConversations,
  getMessages,
  sendMessage,
  markRead,
  updateMessage,
  deleteMessage,
  sendFirstMessage,
  getFeedbackByCourseId
}

export default ChatService
