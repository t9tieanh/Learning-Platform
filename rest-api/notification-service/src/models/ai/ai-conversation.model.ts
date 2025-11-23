import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage {
  role: 'user' | 'ai'; // ai gửi
  content: string;
  createdAt?: Date;
}

export interface IConversation extends Document {
  userId: string; // owner của conversation
  messages: IMessage[]; // danh sách message
  createdAt: Date;
  updatedAt: Date;
}

const messageSchema = new Schema<IMessage>(
  {
    role: { type: String, enum: ['user', 'ai'], required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: true }
);

const conversationSchema = new Schema<IConversation>(
  {
    userId: { type: String, required: true },
    messages: { type: [messageSchema], default: [] }
  },
  { timestamps: true, collection: 'ai_conversations' }
);

export default mongoose.model<IConversation>('AIConversation', conversationSchema);
