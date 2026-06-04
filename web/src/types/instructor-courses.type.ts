export type InstructorCourseItem = {
  id: string
  title: string
  shortDescription?: string | null
  thumbnailUrl?: string | null
  originalPrice?: number | null
  finalPrice?: number | null
  rating?: number | null
  reviewsCount?: number | null
  lessonsCount?: number | null
  duration?: string | null
  category?: { name?: string | null } | string | null
  level?: string | null
  isBestseller?: boolean | null
  createdAt?: string | null
  studentCount?: number | null
  enrolledCount?: number | null
  salesCount?: number | null
  instructor?: {
    id?: string
    name?: string
    image?: string
  } | null
}

export type InstructorCoursesSort = 'newest' | 'rating' | 'students' | 'bestseller'

export type InstructorCoursesApiPayload = {
  instructor: {
    id: string
    name: string
    email: string
    image: string
    description: string
  }
  stats: {
    totalCourses: number
    averageRating: number
  }
  courses: InstructorCourseItem[]
  pagination: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
    hasNext: boolean
  }
}
