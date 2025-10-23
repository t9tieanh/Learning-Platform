export type CourseStatus = 'active' | 'pending' | 'closed' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW'

export interface Course {
  id: string
  title: string
  shortDescription?: string | null
  longDescription?: string | null
  image?: string | null
  thumbnailUrl?: string | null
  language?: string | null
  originalPrice?: number | null
  finalPrice?: number | null
  status: CourseStatus
  instructorId?: string | null
  chapterIds?: string[] | null
  enrollmentIds?: string[] | null
  tagNames?: string[] | null
  categoryName?: string | null
  progressStep?: string | null
  outcomes?: string[] | null
  requirements?: string[] | null
  // Additional UI fields to keep compatibility
  tags?: string[]
  duration?: string
  students?: number
  createdAt?: string
}
