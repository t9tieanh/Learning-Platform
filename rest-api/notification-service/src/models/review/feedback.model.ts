import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IFeedback extends Document {
  userId: string
  instructorId: string
  courseId: string
  rating: number
  message: string
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema: Schema = new Schema({
  userId: { type: String, required: true },
  instructorId: { type: String, required: true, index: true },
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
// Index phục vụ dashboard feedback theo instructor.
FeedbackSchema.index({ instructorId: 1, _id: -1 })
FeedbackSchema.index({ instructorId: 1, rating: 1 })
FeedbackSchema.index({ instructorId: 1, createdAt: -1, _id: -1 })

const Feedback: Model<IFeedback> = mongoose.model<IFeedback>('Feedback', FeedbackSchema)

export { Feedback }
