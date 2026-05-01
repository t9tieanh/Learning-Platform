/**
 * Long-poll / wait helper outcomes for per–chunk-group quiz generation (`waitForGroupQuizJob`).
 * Matches Redis/Bull payload `status` strings where applicable.
 */
export enum LessonTestGenWaitOutcomeKind {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  PROCESSING = 'PROCESSING',
  ABORTED = 'ABORTED',
}

export type LessonTestGenWaitOutcome =
  | { outcome: LessonTestGenWaitOutcomeKind.COMPLETED; createdCount?: number; quizIds?: string[] }
  | { outcome: LessonTestGenWaitOutcomeKind.FAILED; reason: string }
  | { outcome: LessonTestGenWaitOutcomeKind.PROCESSING }
  | { outcome: LessonTestGenWaitOutcomeKind.ABORTED };
