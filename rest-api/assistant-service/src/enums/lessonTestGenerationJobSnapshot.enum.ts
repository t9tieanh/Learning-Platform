/**
 * Status returned by `GET .../lesson-test/generate-quizzes/status` (bulk snapshot, no long-poll).
 * Aligns with Bull-derived states plus Redis-cached terminal outcomes.
 */
export enum LessonTestGenerationJobSnapshotStatus {
  QUEUED = 'QUEUED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}
