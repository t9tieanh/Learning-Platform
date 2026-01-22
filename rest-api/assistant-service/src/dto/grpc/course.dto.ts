export interface InstructorGrpc {
  id: string
  name?: string
  email?: string
  image?: string
}

export interface CourseGrpc {
  id: string
  title?: string
  short_description?: string
  long_description?: string
  thumbnail_url?: string
  rating?: number
  introductory_video?: string
  language?: string
  original_price?: number
  final_price?: number
  instructor?: InstructorGrpc
  [key: string]: any
}

export interface CoursePayload {
  id: string
  courseId: string
  price: number
  raw?: CourseGrpc
}