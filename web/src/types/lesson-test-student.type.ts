/** Student-facing lesson test API (`GET/POST …/lesson-test/student`). */

export interface StudentLessonTestHeader {
  lessonId: string
  title: string | null
  status: string
  targetTotalQuestions?: number | null
  createdAt: string
  updatedAt: string
}

export interface StudentQuizChoice {
  id: string
  text: string
}

export interface StudentQuizItem {
  id: string
  question: string
  type: string
  difficulty: string
  bloomLevel: string
  choices: StudentQuizChoice[]
  isApproved: boolean
  status: string
  createdAt: string
  updatedAt: string
}

export interface StudentChunkGroup {
  id: string
  lessonId: string
  chunkIds: string[]
  questionCount: number
  label: string | null
  createdAt: string
  updatedAt: string
  quizzes: StudentQuizItem[]
}

export interface StudentLessonTestView {
  lessonTest: StudentLessonTestHeader
  chunkGroups: StudentChunkGroup[]
}

export interface LessonTestSubmissionAnswerInput {
  quizId: string
  selectedChoiceIds: string[]
}

export interface LessonTestSubmissionSummary {
  earnedPoints: number
  maxPoints: number
  percent: number
}

export interface LessonTestSubmissionItem {
  quizId: string
  isCorrect: boolean
  pointsEarned: number
  maxPoints: number
  selectedChoiceIds: string[]
  correctChoiceIds?: string[]
  explanation?: string
  chunkId?: string | null
}

export interface LessonTestSubmissionResult {
  submissionId: string
  lessonId: string
  summary: LessonTestSubmissionSummary
  answersRevealed: boolean
  items: LessonTestSubmissionItem[]
  chunks?: import('./ai').LessonChunk[]
  subtitles?: string | null
  isCompletedCourse?: boolean
  certificateId?: string | null
  certificateCode?: string | null
  courseScore?: number | null
  courseScoreTotal?: number | null
}

/** One row in `GET …/student/submissions` (list attempts). */
export interface LessonTestSubmissionHistoryEntry {
  submissionId: string
  submittedAt: string
  summary: LessonTestSubmissionSummary
  answersRevealed: boolean
}

/** `GET …/student/submissions/:submissionId` — same scoring fields as submit, plus question snapshot for review. */
export interface LessonTestSubmissionDetailItem extends LessonTestSubmissionItem {
  question: string
  type: string
  difficulty: string
  bloomLevel: string
  choices: StudentQuizChoice[]
}

import { LessonChunk } from './ai'

export interface LessonTestSubmissionDetailResult {
  submissionId: string
  lessonId: string
  submittedAt: string
  summary: LessonTestSubmissionSummary
  answersRevealed: boolean
  items: LessonTestSubmissionDetailItem[]
  chunks?: LessonChunk[]
  subtitles?: string | null
}
