import mongoose, { Schema, Document, Model, Types } from 'mongoose'
import { IConversation } from './conversation.model'

export interface IMessage extends Document {
  id: Types.ObjectId
  senderId: string
  conversation: IConversation['_id']
  message: string
  replyTo: IMessage['_id']
  attachmentUri: string
  content: string
  createdAt: Date
  updatedAt: Date
}

const MessageSchema: Schema = new Schema({
  senderId: { type: String, required: true },
  conversation: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
  message: { type: String, required: true },
  replyTo: { type: Schema.Types.ObjectId, ref: 'Message' },
  attachmentUri: { type: String },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}).set('toJSON', {
  transform: function (doc, ret) {
    //delete ret.__v

    return ret
  }
})

const MessageModel: Model<IMessage> = mongoose.model<IMessage>('Message', MessageSchema)

export { MessageModel }
