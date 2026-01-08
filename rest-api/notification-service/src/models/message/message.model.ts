import mongoose, { Schema, Document, Types } from 'mongoose'

export type MessageType = 'text' | 'image' | 'file' | 'system'
export type SenderRole = 'student' | 'instructor'
export type MessageStatus = 'sent' | 'read'

export interface IMessage extends Document {
  conversationId: string
  senderId: string
  senderRole: SenderRole
  content?: string
  type: MessageType
  status: MessageStatus
  deliveredTo: string[]
  createdAt: Date
}

const messageSchema = new Schema<IMessage>(
  {
    conversationId: {
      type: String,
      ref: 'Conversation',
      required: true
    },
    senderId: {
      type: String,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['student', 'instructor'],
      required: true
    },
    content: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text'
    },
    status: {
      type: String,
      enum: ['sent', 'read'],
      default: 'sent'
    },
    deliveredTo: [
      {
        type: String,
        ref: 'User'
      }
    ]
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
)

export default mongoose.model<IMessage>('Message', messageSchema)
