import mongoose from 'mongoose'
import Conversation from '../models/message/conversation.model'
import Message from '../models/message/message.model'

async function seed() {
  const instructorId = '4d376e51-e408-4d9c-b181-54f2401a787f'
  const studentId = 'df51b10d-d4e0-4ea7-92e4-748a1ad1cdb9'

  // 1️⃣ Tạo key cố định (sort ID theo string)
  const sortedIds = [instructorId.toString(), studentId.toString()].sort()
  const key = `dm:${sortedIds[0]}:${sortedIds[1]}`

  // 2️⃣ Tìm hoặc tạo conversation
  let conversation = await Conversation.findOne({ key })
  if (!conversation) {
    conversation = await Conversation.create({
      key,
      participants: [instructorId, studentId],
      type: 'direct',
      lastMessageAt: new Date()
    })
    console.log('✅ Created conversation:', conversation._id)
  } else {
    console.log('ℹ️ Conversation already exists:', conversation._id)
  }

  // 3️⃣ Fake tin nhắn
  const messagesData = [
    {
      conversationId: conversation._id,
      senderId: instructorId,
      senderRole: 'instructor',
      content: 'Chào em, hôm nay mình học phần nào rồi?',
      type: 'text',
      status: 'delivered',
      deliveredTo: [studentId],
      readBy: []
    },
    {
      conversationId: conversation._id,
      senderId: studentId,
      senderRole: 'student',
      content: 'Em đã học xong phần React Hooks ạ!',
      type: 'text',
      status: 'read',
      deliveredTo: [instructorId],
      readBy: [instructorId]
    },
    {
      conversationId: conversation._id,
      senderId: instructorId,
      senderRole: 'instructor',
      content: 'Tốt lắm, vậy mai ta làm bài tập useEffect nhé 💪',
      type: 'text',
      status: 'sent',
      deliveredTo: [],
      readBy: []
    }
  ]

  const insertedMessages = await Message.insertMany(messagesData)
  console.log('✅ Inserted messages:', insertedMessages.length)

  // 4️⃣ Cập nhật last message
  const lastMsg = insertedMessages[insertedMessages.length - 1]
  conversation.lastMessageId = lastMsg._id as any
  conversation.lastMessageAt = lastMsg.createdAt
  await conversation.save()

  console.log('✅ Updated conversation last message')
  await mongoose.disconnect()
}

export { seed }
