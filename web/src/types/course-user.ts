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

// --- course of user paging ----

export interface CourseListItem {
  id: string
  title: string
  shortDescription: string
  longDescription: string | null
  thumbnailUrl: string
  rating: number | null
  introductoryVideo: string | null
  language: string | null
  instructor: {
    id: string | null
    name: string
    image: string
    phone: string
    description: string | null
    email: string | null
  }
}

export interface CourseListResult {
  items: CourseListItem[]
  pagination: {
    page: number
    size: number
    totalItems: number
    totalPages: number
    hasNext: boolean
    hasPrevious: boolean
  }
}
