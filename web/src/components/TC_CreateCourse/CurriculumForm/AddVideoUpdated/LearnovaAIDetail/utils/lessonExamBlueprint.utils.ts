/**
 * Shared helpers and types for the "exam by content group" (video chunk) quiz blueprint UI
 * and batch generate flow.
 */
import type { LessonChunk } from '@/types/ai'
import {
  BloomLevel,
  QuizDifficulty,
  type QuizBatchDistributionItem,
} from '@/types/quiz'

/** One blueprint row: one or more lesson chunks (≤ `MAX_CHUNKS_PER_LESSON_TEST_GROUP` merged); `questionCount` is for the whole group. */
export type ExamBlueprintRow = {
  id: string
  /** One or more chunk ids in this group. */
  chunkIds: string[]
  questionCount: number
  instruction: string
  /** Maps to server `LessonTestChunkGroup.label` (tiêu đề nhóm). */
  groupTitle: string
}

/** Base difficulty and Bloom for batch quiz items when not overridden. */
export const DEFAULT_QUIZ_DISTRIBUTION_BASE: Pick<
  QuizBatchDistributionItem,
  'difficulty' | 'bloomLevel'
> = {
  difficulty: QuizDifficulty.MEDIUM,
  bloomLevel: BloomLevel.UNDERSTAND,
}

/** Stable id for a blueprint row (UUID when available). */
export function newExamBlueprintRowId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Per-group default when not deriving from a global total (e.g. newly added row). */
export const DEFAULT_EXAM_QUESTIONS_PER_GROUP = 1

/** UI + assistant-service cap on chunks merged into one lesson-test group. */
export const MAX_CHUNKS_PER_LESSON_TEST_GROUP = 3

/**
 * Consecutive chunks → bucket ids in lesson order, at most `size` per bucket.
 */
export function partitionChunksIntoLessonTestGroups(
  chunks: LessonChunk[],
  size: number = MAX_CHUNKS_PER_LESSON_TEST_GROUP
): string[][] {
  if (!chunks.length || size < 1) {
    return []
  }
  const out: string[][] = []
  for (let i = 0; i < chunks.length; i += size) {
    out.push(chunks.slice(i, i + size).map((c) => c.id))
  }
  return out
}

/**
 * Split `total` questions across `partCount` parts; remainder goes to the first parts.
 * Examples: 5 / 2 → [3, 2]. 2 / 3 → [1, 1, 0].
 */
export function splitQuestionCountAcrossChunks(
  total: number,
  partCount: number
): number[] {
  if (partCount <= 0) {
    return []
  }
  if (total <= 0) {
    return Array(partCount).fill(0)
  }
  if (total < partCount) {
    const out = Array(partCount).fill(0)
    for (let i = 0; i < total; i += 1) {
      out[i] = 1
    }
    return out
  }
  const base = Math.floor(total / partCount)
  const rem = total % partCount
  return Array.from({ length: partCount }, (_, i) => base + (i < rem ? 1 : 0))
}

/**
 * Default target total questions = number of chunks, split across default groups in
 * `buildDefaultExamBlueprintRows` (groups of up to `MAX_CHUNKS_PER_LESSON_TEST_GROUP`).
 */
export function getDefaultTargetTotalQuestionCount(chunks: LessonChunk[]): number {
  if (!chunks.length) {
    return 1
  }
  return Math.max(1, chunks.length)
}

/**
 * Clamp global target: min = group count (at least 1 per group), max = 50 × group count.
 */
export function clampTargetTotalForGroups(
  raw: number,
  groupCount: number
): number {
  if (groupCount <= 0) {
    return 1
  }
  if (Number.isNaN(raw)) {
    return groupCount
  }
  return Math.min(50 * groupCount, Math.max(groupCount, raw))
}

/**
 * Reassign each row’s `questionCount` so the row sums equal `targetTotal` (same split as `splitQuestionCountAcrossChunks`).
 */
export function redistributeQuestionCountsToMatchTotal(
  rows: ExamBlueprintRow[],
  targetTotal: number
): ExamBlueprintRow[] {
  if (rows.length === 0) {
    return rows
  }
  const t = clampTargetTotalForGroups(targetTotal, rows.length)
  const parts = splitQuestionCountAcrossChunks(t, rows.length)
  return rows.map((r, i) => ({
    ...r,
    questionCount: parts[i] ?? 1,
  }))
}

/**
 * Default: each row groups up to 3 consecutive chunks (lesson order); total questions = chunk count,
 * split evenly across rows (same algorithm as `splitQuestionCountAcrossChunks`).
 */
export function buildDefaultExamBlueprintRows(chunks: LessonChunk[]): ExamBlueprintRow[] {
  if (!chunks.length) {
    return []
  }
  const chunkGroups = partitionChunksIntoLessonTestGroups(chunks)
  const groupCount = chunkGroups.length
  const targetTotal = getDefaultTargetTotalQuestionCount(chunks)
  const perGroup = splitQuestionCountAcrossChunks(targetTotal, groupCount)
  return chunkGroups.map((chunkIds, i) => ({
    id: newExamBlueprintRowId(),
    chunkIds,
    questionCount: perGroup[i] ?? DEFAULT_EXAM_QUESTIONS_PER_GROUP,
    instruction: '',
    groupTitle: '',
  }))
}

/** New row: first up-to-3 chunks selected, `DEFAULT_EXAM_QUESTIONS_PER_GROUP` questions, empty instruction. */
export function makeEmptyExamBlueprintRow(chunks: LessonChunk[]): ExamBlueprintRow {
  if (!chunks.length) {
    return {
      id: newExamBlueprintRowId(),
      chunkIds: [],
      questionCount: DEFAULT_EXAM_QUESTIONS_PER_GROUP,
      instruction: '',
      groupTitle: '',
    }
  }
  const take = Math.min(MAX_CHUNKS_PER_LESSON_TEST_GROUP, chunks.length)
  return {
    id: newExamBlueprintRowId(),
    chunkIds: chunks.slice(0, take).map((c) => c.id),
    questionCount: DEFAULT_EXAM_QUESTIONS_PER_GROUP,
    instruction: '',
    groupTitle: '',
  }
}

/**
 * Return valid, deduplicated `row.chunkIds` in chunk-list order, or a fallback to the first chunk.
 */
export function resolveExamBlueprintChunkIds(
  row: ExamBlueprintRow,
  chunks: LessonChunk[]
): string[] {
  const set = new Set(chunks.map((c) => c.id))
  const valid = row.chunkIds.filter((id) => set.has(id))
  const seen = new Set<string>()
  const deduped = valid.filter((id) => (seen.has(id) ? false : (seen.add(id), true)))
  if (deduped.length > 0) {
    return deduped
  }
  return chunks[0] ? [chunks[0].id] : []
}

/** Map id list to chunk objects in the same order (drops missing ids). */
export function getLessonChunksInSelectionOrder(
  allChunks: LessonChunk[],
  orderedIds: string[]
): LessonChunk[] {
  return orderedIds
    .map((id) => allChunks.find((c) => c.id === id))
    .filter((c): c is LessonChunk => c != null)
}

/** Options for a multi-select of lesson chunks. */
export function buildLessonChunkMultiSelectOptions(
  chunks: LessonChunk[]
): { value: string; label: string }[] {
  return chunks.map((c, i) => ({
    value: c.id,
    label: [c.title || `Phân đoạn ${i + 1}`, c.startTime].filter(Boolean).join(' · '),
  }))
}

/**
 * When `chunks` updates: if no prior rows, build defaults; else keep rows but drop removed chunk ids.
 */
export function normalizeExamBlueprintRowsWhenChunksChange(
  prev: ExamBlueprintRow[],
  chunks: LessonChunk[]
): ExamBlueprintRow[] {
  if (!chunks.length) {
    return []
  }
  if (!prev.length) {
    return buildDefaultExamBlueprintRows(chunks)
  }
  const ids = new Set(chunks.map((c) => c.id))
  return prev.map((r) => {
    const base = { ...r, groupTitle: r.groupTitle ?? '' }
    const keep = base.chunkIds.filter((id) => ids.has(id))
    if (keep.length > 0) {
      return { ...base, chunkIds: keep }
    }
    return { ...base, chunkIds: [chunks[0].id] }
  })
}

/** Rows with at least one chunk, 1–50 questions, resolved ids. */
export function getValidExamBlueprintRows(
  rows: ExamBlueprintRow[],
  chunks: LessonChunk[]
): ExamBlueprintRow[] {
  return rows
    .map((r) => ({ ...r, chunkIds: resolveExamBlueprintChunkIds(r, chunks) }))
    .filter(
      (r) =>
        r.chunkIds.length >= 1 &&
        r.questionCount >= 1 &&
        r.questionCount <= 50
    )
}

/**
 * Fingerprint of chunk-group **layout** after a successful lesson-test sync (row id + which chunks belong to each row).
 * Meta edits (title, batch prompt, question count) intentionally do **not** affect this — otherwise optimistic `updateRow`
 * during PATCH would briefly diverge from `bulkSyncSignature` and wipe cached quizzes.
 */
export function blueprintSyncSignature(
  rows: ExamBlueprintRow[],
  chunks: LessonChunk[]
): string {
  const valid = getValidExamBlueprintRows(rows, chunks)
  return valid
    .map((r) => {
      const ids = [...r.chunkIds].sort().join(',')
      return `${r.id}:${ids}`
    })
    .join('|')
}

/** Single distribution entry for a batch generate call (one difficulty/Bloom, `count` questions). */
export function buildBatchDistributionForCount(
  questionCount: number
): QuizBatchDistributionItem[] {
  return [
    {
      ...DEFAULT_QUIZ_DISTRIBUTION_BASE,
      count: questionCount,
    },
  ]
}

/** Per-row or per-chunk count input: integer in [1, 50]. */
export function clampQuestionCount(raw: number): number {
  if (Number.isNaN(raw)) {
    return 1
  }
  return Math.min(50, Math.max(1, raw))
}
