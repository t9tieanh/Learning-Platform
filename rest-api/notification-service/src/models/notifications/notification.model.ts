import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface INotification extends Document {
  id: Types.ObjectId
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  createdAt: Date
  updatedAt: Date
}

const NotificationSchema: Schema = new Schema({
  userId: { type: String, ref: 'User' },
  type: { type: String, enum: ['info', 'warning', 'error'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}).set('toJSON', {
  transform: function (doc, ret) {
    //delete ret.__v

    return ret
  }
})

const NotificationModel: Model<INotification> = mongoose.model<INotification>('Notification', NotificationSchema)

export { NotificationModel }
