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

/** One blueprint row: one or more video chunks; `questionCount` is split per chunk at generate time. */
export type ExamBlueprintRow = {
  id: string
  /** One or more chunk ids in this group. */
  chunkIds: string[]
  questionCount: number
  instruction: string
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
 * Default target total = chunk count (even split yields 1+1+…+1). Same as `buildDefaultExamBlueprintRows`.
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
 * Default: one row per chunk, in chunk order, total questions = `chunks.length` (split as 1+1+…+1).
 */
export function buildDefaultExamBlueprintRows(chunks: LessonChunk[]): ExamBlueprintRow[] {
  if (!chunks.length) {
    return []
  }
  const targetTotal = getDefaultTargetTotalQuestionCount(chunks)
  const perGroup = splitQuestionCountAcrossChunks(targetTotal, chunks.length)
  return chunks.map((c, i) => ({
    id: newExamBlueprintRowId(),
    chunkIds: [c.id],
    questionCount: perGroup[i] ?? DEFAULT_EXAM_QUESTIONS_PER_GROUP,
    instruction: '',
  }))
}

/** New row: first chunk selected, `DEFAULT_EXAM_QUESTIONS_PER_GROUP` questions, empty instruction. */
export function makeEmptyExamBlueprintRow(chunks: LessonChunk[]): ExamBlueprintRow {
  const first = chunks[0]
  return {
    id: newExamBlueprintRowId(),
    chunkIds: first ? [first.id] : [],
    questionCount: DEFAULT_EXAM_QUESTIONS_PER_GROUP,
    instruction: '',
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
    const keep = r.chunkIds.filter((id) => ids.has(id))
    if (keep.length > 0) {
      return { ...r, chunkIds: keep }
    }
    return { ...r, chunkIds: [chunks[0].id] }
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
