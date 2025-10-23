import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IConversation extends Document {
  id: Types.ObjectId
  members: string[]
  avatarUrl: string
  name: string
  createdAt: Date
  updatedAt: Date
}

const ConversationSchema: Schema = new Schema({
  members: [{ type: String }],
  avatarUrl: { type: String, required: true },
  name: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}).set('toJSON', {
  transform: function (doc, ret) {
    //delete ret.__v

    return ret
  }
})

const ConversationModel: Model<IConversation> = mongoose.model<IConversation>('Conversation', ConversationSchema)

export { ConversationModel }
