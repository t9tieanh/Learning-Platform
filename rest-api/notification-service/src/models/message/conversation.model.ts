import mongoose, { Schema, Document, Types } from 'mongoose'

export interface IParticipant {
  userId: string // ID của user
  role: 'student' | 'instructor'
}
export interface IConversation extends Document {
  key: string
  type: 'direct'
  participants: IParticipant[]
  lastMessageId?: string
  lastMessageAt?: Date
  createdAt: Date
  updatedAt: Date
}

const participantSchema = new Schema<IParticipant>(
  {
    userId: { type: String, ref: 'User', required: true },
    role: { type: String, enum: ['student', 'instructor'], required: true }
  },
  { _id: false }
)

const conversationSchema = new Schema<IConversation>(
  {
    key: { type: String, required: true, unique: true },
    type: { type: String, enum: ['direct'], default: 'direct' },
    participants: { type: [participantSchema], required: true },
    lastMessageId: {
      type: String,
      ref: 'Message'
    },
    lastMessageAt: { type: Date }
  },
  { timestamps: true }
)

export default mongoose.model<IConversation>('Conversation', conversationSchema)
