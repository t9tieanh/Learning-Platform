import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IComment extends Document {
  id: Types.ObjectId
  courseId?: string
  lessonId?: string
  userId: string
  content: string
  reply?: Types.ObjectId
  createdAt: Date
  updatedAt: Date
}

const CommentSchema: Schema = new Schema({
  courseId: { type: String },
  lessonId: { type: String },
  userId: { type: String, required: true },
  content: { type: String, required: true },
  reply: { type: [this], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}).set('toJSON', {
  transform: function (doc, ret) {
    return ret
  }
})

const CommentModel: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema)

export { CommentModel }
