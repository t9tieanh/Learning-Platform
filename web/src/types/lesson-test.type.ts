import type { QuizBatchDistributionItem } from '@/types/quiz'

// ---------------------------------------------------------------------------
// Enumerations — align with assistant-service Prisma / job snapshots
// ---------------------------------------------------------------------------

export enum LessonTestStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum LessonTestJobSnapshotStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

/** Single-group generate-quizzes status endpoint payload discriminator */
export enum LessonTestGroupGenStatus {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
}

// ---------------------------------------------------------------------------
// Lesson-test blueprint API DTOs
// ---------------------------------------------------------------------------

export interface PutLessonTestPayload {
  title?: string | null
  status?: LessonTestStatus
  targetTotalQuestions?: number | null
  notes?: string | null
}

export interface LessonTestHeaderDto {
  lessonId: string
  title: string | null
  status: LessonTestStatus
  targetTotalQuestions: number | null
  notes: string | null
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface LessonTestChunkGroupBundleDto {
  id: string
  lessonId: string
  chunkIds: string[]
  questionCount: number
  label: string | null
  distribution: unknown
  batchUserPrompt: string | null
  createdAt: string
  updatedAt: string
  generation: {
    state: string
    jobId: string | null
    lastError?: string
  }
}

export interface LessonTestBundleResponse {
  lessonTest: LessonTestHeaderDto
  chunkGroups: LessonTestChunkGroupBundleDto[]
}

export interface CreateLessonTestChunkGroupPayload {
  chunkIds: string[]
  questionCount: number
  label?: string | null
  distribution?: QuizBatchDistributionItem[] | unknown
  batchUserPrompt?: string | null
}

export interface LessonTestChunkGroupCreatedDto {
  id: string
  lessonId: string
  chunkIds: string[]
  questionCount: number
  label: string | null
  distribution: unknown
  batchUserPrompt: string | null
  createdAt: string
  updatedAt: string
}

export interface BulkEnqueueJobsResult {
  jobs: Array<{ groupId: string; jobId: string }>
}

export interface LessonTestJobSnapshotItemDto {
  groupId: string
  jobId: string
  status: LessonTestJobSnapshotStatus
  createdCount?: number
  quizIds?: string[]
  reason?: string
}

export interface GroupGenerateAcceptedDto {
  groupId: string
  jobId: string
}

export type GroupGenTerminalDto =
  | { status: LessonTestGroupGenStatus.COMPLETED; createdCount?: number; quizIds?: string[] }
  | { status: LessonTestGroupGenStatus.FAILED; reason: string }
  | { status: LessonTestGroupGenStatus.PROCESSING }
