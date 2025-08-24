import { ConversationModel } from '../models/message/conversation.model'
import { MessageModel } from '../models/message/message.model'
import { NotificationModel } from '../models/notifications/notification.model'
import { CommentModel } from '../models/review/comment.model'
import { FeedbackModel } from '../models/review/feedback.model'

async function seedAll() {
  console.log('Seeding all collections...')
  // Xóa dữ liệu cũ
  await ConversationModel.deleteMany({})
  await MessageModel.deleteMany({})
  await NotificationModel.deleteMany({})
  await CommentModel.deleteMany({})
  await FeedbackModel.deleteMany({})

  // Seed Conversation
  const conversations = await ConversationModel.insertMany(
    Array.from({ length: 20 }).map((_, i) => ({
      members: [`user${i + 1}`, `user${i + 2}`],
      avatarUrl: `https://api.adorable.io/avatars/285/${i}.png`,
      name: `Conversation ${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  )

  // Seed Message (đúng schema: conversation, senderId, message, content, ...)
  await MessageModel.insertMany(
    Array.from({ length: 20 }).map((_, i) => ({
      conversation: conversations[i % conversations.length]._id,
      senderId: `user${(i % 5) + 1}`,
      message: `Message content ${i + 1}`,
      content: `Message content ${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  )

  // Seed Notification
  await NotificationModel.insertMany(
    Array.from({ length: 20 }).map((_, i) => ({
      userId: `user${(i % 10) + 1}`,
      type: 'info',
      title: `Notification ${i + 1}`,
      message: `Nội dung thông báo ${i + 1}`,
      isRead: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  )

  //   id: Types.ObjectId
  //     userId: string
  //     type: string
  //     title: string
  //     message: string
  //     read: boolean
  //     createdAt: Date
  //     updatedAt: Date

  // Seed Comment
  await CommentModel.insertMany(
    Array.from({ length: 20 }).map((_, i) => ({
      courseId: `course${(i % 3) + 1}`,
      lessonId: `lesson${(i % 5) + 1}`,
      userId: `user${(i % 10) + 1}`,
      content: `Comment nội dung ${i + 1}`,
      reply: [
        {
          userId: `user${((i + 1) % 10) + 1}`,
          content: `Reply cho comment ${i + 1}`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          userId: `user${((i + 2) % 10) + 1}`,
          content: `Reply khác cho comment ${i + 1}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  )

  // Seed Feedback
  await FeedbackModel.insertMany(
    Array.from({ length: 20 }).map((_, i) => ({
      userId: `user${(i % 10) + 1}`,
      courseId: `course${(i % 3) + 1}`,
      rating: Math.floor(Math.random() * 5) + 1,
      message: `Feedback nội dung ${i + 1}`,
      createdAt: new Date(),
      updatedAt: new Date()
    }))
  )

  console.log('Seed tất cả collection thành công!')
}

export { seedAll }
