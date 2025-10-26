import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IConversation extends Document {
  key: string; // ví dụ: dm:u1:u2
  type: 'direct';
  participants: String[];
  lastMessageId?: String;
  lastMessageAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
  {
    key: { type: String, required: true, unique: true },
    type: { type: String, enum: ['direct'], default: 'direct' },
    participants: [
      {
        type: String,
        ref: 'User',
        required: true,
      },
    ],
    lastMessageId: {
      type: String,
      ref: 'Message',
    },
    lastMessageAt: { type: Date },
  },
  { timestamps: true },
);

export default mongoose.model<IConversation>('Conversation', conversationSchema);
