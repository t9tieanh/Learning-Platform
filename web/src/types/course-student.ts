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

export interface CertificateSummary {
  id: string
  certificateCode: string
  issuedAt: string
  status: string
}

export interface CertificateJourney {
  completedLessons: number
  totalLessons: number
  progressPercent: number
  certificateIssued: boolean
  certificate: CertificateSummary | null
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
  progress?: number | null
  certificateJourney?: CertificateJourney | null
  chapters: Chapter[]
}
