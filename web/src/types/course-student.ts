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

export type CertificateJourneyPendingTestStatus = 'NOT_ATTEMPTED' | 'NOT_PASSED'

export interface CertificateJourneyPendingTest {
  lessonId: string
  lessonTitle: string | null
  chapterId: string | null
  chapterTitle: string | null
  chapterPosition: number | null
  lessonPosition: number | null
  bestPercent: number
  attempted: boolean
  status: CertificateJourneyPendingTestStatus
}

export interface CertificateJourney {
  completedLessons: number
  totalLessons: number
  progressPercent: number
  certificateIssued: boolean
  certificate: CertificateSummary | null
  lessonsWithTest?: number
  passedTests?: number
  testProgressPercent?: number
  minPassPercent?: number
  lessonsComplete?: boolean
  testsComplete?: boolean
  eligibleForCertificate?: boolean
  blockers?: string[]
  pendingLessonTests?: CertificateJourneyPendingTest[]
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
