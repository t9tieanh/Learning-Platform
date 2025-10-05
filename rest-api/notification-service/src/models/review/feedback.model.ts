import mongoose, { Schema, Document, Model } from 'mongoose'

interface IFeedback extends Document {
  userId: string
  courseId: string
  rating: number
  message: string
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema: Schema = new Schema({
  userId: { type: String, required: true },
  courseId: { type: String, required: true },
  rating: { type: Number, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}).set('toJSON', {
  transform: function (doc, ret) {
    //delete ret.__v
    return ret
  }
})

// Index phục vụ truy vấn phân trang theo course + _id (cursor)
FeedbackSchema.index({ courseId: 1, _id: -1 })

const Feedback: Model<IFeedback> = mongoose.model<IFeedback>('Feedback', FeedbackSchema)

export { Feedback }
