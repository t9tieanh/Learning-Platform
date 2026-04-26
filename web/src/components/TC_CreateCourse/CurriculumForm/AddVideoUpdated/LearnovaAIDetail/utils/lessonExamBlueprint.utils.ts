import type { LessonChunk } from '@/types/ai'
import {
  BloomLevel,
  QuizDifficulty,
  type QuizBatchDistributionItem,
} from '@/types/quiz'

export type ExamBlueprintRow = {
  id: string
  /** Một hoặc nhiều phân đoạn (nhóm) — số câu được chia cho từng phân đoạn khi sinh. */
  chunkIds: string[]
  questionCount: number
  instruction: string
}

export const DEFAULT_QUIZ_DISTRIBUTION_BASE: Pick<
  QuizBatchDistributionItem,
  'difficulty' | 'bloomLevel'
> = {
  difficulty: QuizDifficulty.MEDIUM,
  bloomLevel: BloomLevel.UNDERSTAND,
}

export function newExamBlueprintRowId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `row-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/** Số câu mặc định mỗi dòng cấu hình (một nhóm trên ma trận). */
export const DEFAULT_EXAM_QUESTIONS_PER_GROUP = 1

/**
 * Default form: mỗi phân đoạn một dòng, mỗi dòng gắn đúng một chunk, số câu mặc định
 * theo `DEFAULT_EXAM_QUESTIONS_PER_GROUP` (1).
 * Thứ tự dòng bám theo thứ tự `chunks`.
 */
export function buildDefaultExamBlueprintRows(chunks: LessonChunk[]): ExamBlueprintRow[] {
  if (!chunks.length) {
    return []
  }
  return chunks.map((c) => ({
    id: newExamBlueprintRowId(),
    chunkIds: [c.id],
    questionCount: DEFAULT_EXAM_QUESTIONS_PER_GROUP,
    instruction: '',
  }))
}

export function makeEmptyExamBlueprintRow(chunks: LessonChunk[]): ExamBlueprintRow {
  const first = chunks[0]
  return {
    id: newExamBlueprintRowId(),
    chunkIds: first ? [first.id] : [],
    questionCount: DEFAULT_EXAM_QUESTIONS_PER_GROUP,
    instruction: '',
  }
}

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

export function getLessonChunksInSelectionOrder(
  allChunks: LessonChunk[],
  orderedIds: string[]
): LessonChunk[] {
  return orderedIds
    .map((id) => allChunks.find((c) => c.id === id))
    .filter((c): c is LessonChunk => c != null)
}

export function buildLessonChunkMultiSelectOptions(
  chunks: LessonChunk[]
): { value: string; label: string }[] {
  return chunks.map((c, i) => ({
    value: c.id,
    label: [c.title || `Phân đoạn ${i + 1}`, c.startTime].filter(Boolean).join(' · '),
  }))
}

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
 * Chia tổng số câu cho từng phân đoạn trong nhóm (phần dư ưu tiên các phân đoạn đầu).
 * Ví dụ: 5 câu / 2 phân đoạn → [3, 2]. 2 câu / 3 phân đoạn → [1, 1, 0].
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

export function clampQuestionCount(raw: number): number {
  if (Number.isNaN(raw)) {
    return 1
  }
  return Math.min(50, Math.max(1, raw))
}
