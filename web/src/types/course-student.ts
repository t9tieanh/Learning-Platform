export interface Lesson {
  id: string
  title: string
  content: string
  duration: number | null
  position: number | null
  type: 'video' | 'article'
  introductionVideo?: string | null
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
