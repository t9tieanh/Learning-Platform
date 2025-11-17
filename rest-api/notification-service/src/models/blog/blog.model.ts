import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IBlog extends Document {
    _id: Types.ObjectId
    instructor_id: Types.ObjectId
    title: string
    image_url: string
    content: string
    markdown_file_url: string
    createdAt: Date
    updatedAt: Date
}

const BlogSchema: Schema = new Schema(
    {
        instructor_id: { type: String, ref: 'Instructor', required: true },
        title: { type: String, required: true },
        image_url: { type: String, required: true },
        content: { type: String, required: true },
        markdown_file_url: { type: [String], default: [] }
    },
    {
        timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
        toJSON: {
            transform: function (doc, ret) {
                // delete ret.__v
                return ret
            }
        }
    }
)

const BlogModel: Model<IBlog> = mongoose.model<IBlog>('Blog', BlogSchema)

export { BlogModel }
