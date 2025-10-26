export interface Lesson {
  title: string
  content: string | null
  duration: number
  position: number | null
  isPublic: boolean
  type: 'video' | 'article' | 'quiz' | string
  url: string | null
}

export interface CourseSection {
  title: string
  description: string | null
  position: number
  isOpen: boolean
  lessons: Lesson[]
}
