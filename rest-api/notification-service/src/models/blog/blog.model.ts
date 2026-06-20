import mongoose, { Schema, Document, Model, Types } from 'mongoose'

export interface IBlog extends Document {
  _id: Types.ObjectId
  instructor_id: Types.ObjectId
  instructor_name: string
  instructor_image: string
  title: string
  image_url: string
  content: string
  tags: string[]
  markdown_file_url: string[]
  createdAt: Date
  updatedAt: Date
}

const BlogSchema: Schema = new Schema(
  {
    instructor_id: { type: String, ref: 'Instructor', required: true },
    // Denormalized snapshot from user-service.
    // Re-sync when instructor profile changes (event-driven consumer).
    instructor_name: { type: String, default: '' },
    instructor_image: { type: String, default: '' },
    title: { type: String, required: true },
    image_url: { type: String, required: true },
    content: { type: String, required: true },
    tags: { type: [String], default: [] },
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

// Full-text search index for title/content/instructor_name.
BlogSchema.index(
  { title: 'text', content: 'text', instructor_name: 'text' },
  { weights: { title: 10, instructor_name: 6, content: 4 }, name: 'blog_text_search_idx' }
)

BlogSchema.index({ instructor_id: 1, createdAt: -1 }, { name: 'blog_instructor_created_at_idx' })

const BlogModel: Model<IBlog> = mongoose.model<IBlog>('Blog', BlogSchema)

export { BlogModel }
