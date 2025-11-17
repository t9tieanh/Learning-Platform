export interface Lesson {
  id: string
  title: string
  content: string
  duration: number | null
  position: number | null
  type: 'video' | 'article'
  completionStatus: 'NOT_STARTED' | 'COMPLETED'

  // Optional video URL for video of course
  introductionVideo?: string | null
  thumbnailUrl?: string | null
}

export interface Chapter {
  id: string
  title: string
  description: string | null
  position: number
  lessons: Lesson[]
}

export interface CourseDetail {
  id: string
  title: string
  shortDescription: string
  longDescription: string
  thumbnailUrl: string
  introductoryVideo: string
  language: string | null
  rating: number | null
  status: string
  instructor: string | null
  chapters: Chapter[]
}
