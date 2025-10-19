export type LessonType = 'video' | 'quiz' | 'article'

export interface Lesson {
  id: string
  title: string
  type: LessonType
  duration: string
  videoUrl?: string
  completed?: boolean
}

export interface Section {
  id: string
  title: string
  order: number
  lessons: Lesson[]
}

export interface Instructor {
  id: string
  name?: string
  image?: string
  bio?: string
  coursesCount?: number
  email?: string
}

export interface Review {
  id: string
  reviewerName: string
  reviewerAvatar?: string
  rating: number
  comment: string
  date: string
}

export interface CourseStats {
  revenue: number
  publishedAt: string
}

export interface Course {
  id: string
  title: string
  thumbnailUrl: string
  introVideo?: string
  shortDescription: string
  longDescription: string
  studentsCount: number
  rating: number
  reviewsCount: number
  originalPrice?: number
  finalPrice?: number
  category?: string
  tags?: string[]
  status: 'published' | 'draft'
  learningOutcomes: string[]
  prerequisites: string[]
  sections: Section[]
  instructor: Instructor
  stats: CourseStats
  reviews: Review[]
}

export interface CourseResponse {
  id: number
  title: string
  price: string
  image: string
}
