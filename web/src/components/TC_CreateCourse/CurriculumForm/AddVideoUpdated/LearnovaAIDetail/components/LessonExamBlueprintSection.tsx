import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { AxiosError } from 'axios'
import {
  ArrowLeft,
  ChevronDown,
  ClipboardList,
  Eye,
  Layers,
  LayoutList,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Rocket,
  ScrollText,
  Sparkles,
  Trash2,
  Undo2,
} from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import { LessonType } from '@/types/lesson'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import CustomButton from '@/components/common/Button'
import MultiSelectSearch from '@/components/common/MultiSelectSearch'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import { cn } from '@/lib/utils'
import LessonExamBlueprintHelpPanel from './LessonExamBlueprintHelpPanel'
import LessonExamBlueprintTargetTotalCard from './LessonExamBlueprintTargetTotalCard'
import LessonExamBlueprintRowMetaInlineEditor from './LessonExamBlueprintRowMetaInlineEditor'
import LessonExamBlueprintTestPreviewPanel from './LessonExamBlueprintTestPreviewPanel'
import lessonTestService from '@/services/assistant/lessonTest.service'
import quizService from '@/services/assistant/quiz.service'
import type {
  AnalysisLessonTestChunkGroupSnapshot,
  AnalysisLessonTestHeaderSnapshot,
} from '@/services/assistant/analysis.service'
import { LessonTestJobSnapshotStatus, LessonTestStatus } from '@/types/lesson-test.type'
import type { GeneratedQuiz } from '@/types/quiz'
import { toast } from 'sonner'
import { useVipUpgrade } from '@/contexts/VipUpgradeContext'
import { useAuthStore } from '@/stores/useAuth.stores'
import {
  type ExamBlueprintRow,
  buildBatchDistributionForCount,
  buildDefaultExamBlueprintRows,
  buildLessonChunkMultiSelectOptions,
  clampQuestionCount,
  clampTargetTotalForGroups,
  getDefaultTargetTotalQuestionCount,
  getLessonChunksInSelectionOrder,
  getValidExamBlueprintRows,
  makeEmptyExamBlueprintRow,
  MAX_CHUNKS_PER_LESSON_TEST_GROUP,
  normalizeExamBlueprintRowsWhenChunksChange,
  redistributeQuestionCountsToMatchTotal,
  resolveExamBlueprintChunkIds,
  blueprintSyncSignature,
} from '../utils/lessonExamBlueprint.utils'

export type { ExamBlueprintRow } from '../utils/lessonExamBlueprint.utils'

interface LessonExamBlueprintSectionProps {
  lessonId: string
  chunks: LessonChunk[]
  /** From GET analysis — hydrate blueprint rows when chunk groups exist on server */
  persistedLessonTest?: AnalysisLessonTestHeaderSnapshot | null
  persistedLessonTestChunkGroups?: AnalysisLessonTestChunkGroupSnapshot[]
  onAfterGenerate?: () => void
  /** When set, shows a back control inside the blue header (e.g. return to lecture structure). */
  onBackToStructure?: () => void
  handleSeek?: (startTime: string | null) => void
  lessonType?: LessonType
  lessonTitle?: string
}

/** Section: map chunks to config groups, target total, then batch-generate quizzes per group (VIP). */
const LessonExamBlueprintSection: React.FC<LessonExamBlueprintSectionProps> = ({
  lessonId,
  chunks,
  persistedLessonTest = null,
  persistedLessonTestChunkGroups = [],
  onAfterGenerate,
  onBackToStructure,
  handleSeek,
  lessonType,
  lessonTitle
}) => {
  const { openVipDialog } = useVipUpgrade()
  const { data: authData } = useAuthStore()
  const isVip = authData?.isVip ?? false

  const chunkOptions = useMemo(
    () => buildLessonChunkMultiSelectOptions(chunks),
    [chunks]
  )

  const chunkIdsKey = useMemo(() => chunks.map((c) => c.id).join(','), [chunks])

  const persistedBlueprintKey = useMemo(() => {
    const g = persistedLessonTestChunkGroups
    if (!g.length) return ''
    return JSON.stringify(
      g.map((x) => ({
        id: x.id,
        q: x.questionCount,
        c: [...x.chunkIds].sort(),
        b: x.batchUserPrompt ?? '',
        l: x.label ?? '',
      }))
    )
  }, [persistedLessonTestChunkGroups])

  const [rows, setRows] = useState<ExamBlueprintRow[]>(() =>
    buildDefaultExamBlueprintRows(chunks)
  )
  const [targetTotal, setTargetTotal] = useState(() =>
    getDefaultTargetTotalQuestionCount(chunks)
  )
  const [isGenerating, setIsGenerating] = useState(false)
  /** Server chunk-group ids aligned with last successful bulk sync (for “regenerate this group”). */
  const [groupIdsByRowId, setGroupIdsByRowId] = useState<Record<string, string>>({})
  /** Blueprint fingerprint after bulk success; cleared when the user edits layout/counts/instructions. */
  const [bulkSyncSignature, setBulkSyncSignature] = useState<string | null>(null)
  const [singleGroupRowId, setSingleGroupRowId] = useState<string | null>(null)
  /** Quizzes loaded per blueprint row (lazy when group panel opens; incremental bulk still pushes here). */
  const [lessonTestQuizzesByRowId, setLessonTestQuizzesByRowId] = useState<
    Record<string, GeneratedQuiz[]>
  >({})
  /** Row ids currently fetching GET …/chunk-groups/:id/quizzes */
  const [quizFetchLoadingRowIds, setQuizFetchLoadingRowIds] = useState<Record<string, boolean>>({})
  /** Dedupe incremental fetch during one bulk poll run (by server group id). */
  const bulkHandledCompletedGroupIdsRef = useRef<Set<string>>(new Set())
  const lessonTestQuizzesByRowIdRef = useRef(lessonTestQuizzesByRowId)
  lessonTestQuizzesByRowIdRef.current = lessonTestQuizzesByRowId
  const quizFetchInFlightRef = useRef<Set<string>>(new Set())
  /** Per group row: which chunk’s summary is shown in the preview (must be in that row’s selected chunks). */
  const [previewChunkIdByRow, setPreviewChunkIdByRow] = useState<Record<string, string>>({})
  /** Whether each config group card is expanded; missing key → first group defaults to open. */
  const [rowOpen, setRowOpen] = useState<Record<string, boolean>>({})
  /** Chunk-group PATCH save in flight (`PATCH …/lesson-test/chunk-groups/:groupId`). */
  const [savingGroupRowId, setSavingGroupRowId] = useState<string | null>(null)
  /** Row whose header meta is being edited inline (title, count, prompt). */
  const [metaInlineEditRowId, setMetaInlineEditRowId] = useState<string | null>(null)
  const [lessonTestHeaderStatus, setLessonTestHeaderStatus] = useState<LessonTestStatus>(() => {
    const raw = persistedLessonTest?.status
    if (raw === LessonTestStatus.PUBLISHED) return LessonTestStatus.PUBLISHED
    if (raw === LessonTestStatus.ARCHIVED) return LessonTestStatus.ARCHIVED
    return LessonTestStatus.DRAFT
  })
  const [publishActionLoading, setPublishActionLoading] = useState(false)
  const rowOpsLocked = singleGroupRowId !== null || savingGroupRowId !== null || publishActionLoading

  useEffect(() => {
    const raw = persistedLessonTest?.status
    if (raw === LessonTestStatus.PUBLISHED) setLessonTestHeaderStatus(LessonTestStatus.PUBLISHED)
    else if (raw === LessonTestStatus.ARCHIVED) setLessonTestHeaderStatus(LessonTestStatus.ARCHIVED)
    else if (raw === LessonTestStatus.DRAFT || raw != null) setLessonTestHeaderStatus(LessonTestStatus.DRAFT)
  }, [persistedLessonTest?.status])

  useEffect(() => {
    if (metaInlineEditRowId && !rows.some((r) => r.id === metaInlineEditRowId)) {
      setMetaInlineEditRowId(null)
    }
  }, [rows, metaInlineEditRowId])

  const hasServerChunkGroups = useMemo(
    () => Object.keys(groupIdsByRowId).length > 0,
    [groupIdsByRowId]
  )

  /** Bump to refetch flat learner-order quizzes from GET …/lesson-test */
  const [flatLessonTestPreviewTick, setFlatLessonTestPreviewTick] = useState(0)
  const refreshFlatLessonTestPreview = useCallback(() => {
    setFlatLessonTestPreviewTick((t) => t + 1)
  }, [])

  const [flatLessonTestQuizzes, setFlatLessonTestQuizzes] = useState<GeneratedQuiz[]>([])
  const [showPreview, setShowPreview] = useState(false)
  const [flatLessonTestPreviewLoading, setFlatLessonTestPreviewLoading] = useState(false)
  const [flatLessonTestTitleFromApi, setFlatLessonTestTitleFromApi] = useState<string | null>(null)

  useEffect(() => {
    if (!lessonId || !hasServerChunkGroups) {
      setFlatLessonTestQuizzes([])
      setFlatLessonTestTitleFromApi(null)
      setFlatLessonTestPreviewLoading(false)
      return
    }

    let cancelled = false
    setFlatLessonTestPreviewLoading(true)

    lessonTestService
      .fetchLessonTestBundle(lessonId)
      .then((bundle) => {
        if (cancelled) return
        setFlatLessonTestQuizzes(bundle?.quizzes ?? [])
        setFlatLessonTestTitleFromApi(bundle?.lessonTest?.title ?? null)
        const st = bundle?.lessonTest?.status
        if (st === LessonTestStatus.PUBLISHED) setLessonTestHeaderStatus(LessonTestStatus.PUBLISHED)
        else if (st === LessonTestStatus.ARCHIVED) setLessonTestHeaderStatus(LessonTestStatus.ARCHIVED)
        else if (bundle?.lessonTest) setLessonTestHeaderStatus(LessonTestStatus.DRAFT)
      })
      .catch(() => {
        if (cancelled) return
        toast.error('Không tải được bài kiểm tra đầy đủ để xem trước.')
        setFlatLessonTestQuizzes([])
      })
      .finally(() => {
        if (!cancelled) setFlatLessonTestPreviewLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [lessonId, hasServerChunkGroups, flatLessonTestPreviewTick])

  useEffect(() => {
    setLessonTestQuizzesByRowId({})
    quizFetchInFlightRef.current.clear()
    setQuizFetchLoadingRowIds({})
  }, [lessonId])

  const ensureQuizzesForRow = useCallback(
    async (rowId: string) => {
      const groupId = groupIdsByRowId[rowId]
      if (!groupId) return
      if (lessonTestQuizzesByRowIdRef.current[rowId] !== undefined) return
      if (quizFetchInFlightRef.current.has(rowId)) return

      quizFetchInFlightRef.current.add(rowId)
      setQuizFetchLoadingRowIds((p) => ({ ...p, [rowId]: true }))
      try {
        const res = await lessonTestService.getChunkGroupQuizzes(groupId)
        const list =
          res.code === 200 && Array.isArray(res.result) ? res.result : []
        setLessonTestQuizzesByRowId((prev) => ({ ...prev, [rowId]: list }))
      } catch {
        toast.error('Không tải được danh sách câu đề ôn cho nhóm này.')
        setLessonTestQuizzesByRowId((prev) =>
          prev[rowId] !== undefined ? prev : { ...prev, [rowId]: [] }
        )
      } finally {
        quizFetchInFlightRef.current.delete(rowId)
        setQuizFetchLoadingRowIds((p) => {
          const next = { ...p }
          delete next[rowId]
          return next
        })
      }
    },
    [groupIdsByRowId]
  )

  /** First row defaults open; Radix does not fire onOpenChange on mount, so fetch quizzes when rows/open state imply expanded. */
  useEffect(() => {
    rows.forEach((row, index) => {
      const isOpen = rowOpen[row.id] ?? index === 0
      if (isOpen) void ensureQuizzesForRow(row.id)
    })
  }, [rows, rowOpen, ensureQuizzesForRow])

  useEffect(() => {
    if (!chunks.length) {
      setRows([])
      return
    }

    if (persistedLessonTestChunkGroups.length > 0) {
      const chunkIdSet = new Set(chunks.map((c) => c.id))
      const nextRows: ExamBlueprintRow[] = persistedLessonTestChunkGroups
        .map((g) => ({
          id: g.id,
          chunkIds: g.chunkIds.filter((id) => chunkIdSet.has(id)),
          questionCount: clampQuestionCount(g.questionCount),
          instruction: g.batchUserPrompt?.trim() ?? '',
          groupTitle: g.label?.trim() ?? '',
        }))
        .filter((r) => r.chunkIds.length > 0)

      if (nextRows.length === 0) {
        setRows(buildDefaultExamBlueprintRows(chunks))
        setTargetTotal(getDefaultTargetTotalQuestionCount(chunks))
        setGroupIdsByRowId({})
        setBulkSyncSignature(null)
        return
      }

      setRows(nextRows)
      const sumQuestions = nextRows.reduce((s, r) => s + r.questionCount, 0)
      const tt =
        persistedLessonTest?.targetTotalQuestions != null
          ? clampTargetTotalForGroups(
            persistedLessonTest.targetTotalQuestions,
            nextRows.length
          )
          : clampTargetTotalForGroups(sumQuestions, nextRows.length)
      setTargetTotal(tt)

      const gidMap: Record<string, string> = {}
      for (const r of nextRows) {
        gidMap[r.id] = r.id
      }
      setGroupIdsByRowId(gidMap)
      setBulkSyncSignature(blueprintSyncSignature(nextRows, chunks))
      return
    }

    setRows((prev) => {
      const next = normalizeExamBlueprintRowsWhenChunksChange(prev, chunks)
      if (!prev.length && next.length) {
        const sum = next.reduce((s, r) => s + r.questionCount, 0)
        queueMicrotask(() => {
          setTargetTotal(clampTargetTotalForGroups(sum, next.length))
        })
      }
      return next
    })
  }, [
    chunkIdsKey,
    persistedBlueprintKey,
    chunks,
    persistedLessonTestChunkGroups,
    persistedLessonTest,
  ])

  const sumRowQuestionCounts = useMemo(
    () => rows.reduce((s, r) => s + r.questionCount, 0),
    [rows]
  )
  const countsMatchTarget = sumRowQuestionCounts === targetTotal
  const minTotalForLayout = rows.length
  const maxTotalForLayout = 50 * Math.max(1, rows.length)

  useEffect(() => {
    setRowOpen((prev) => {
      const ids = new Set(rows.map((r) => r.id))
      const next: Record<string, boolean> = {}
      for (const k of Object.keys(prev)) {
        if (ids.has(k)) {
          next[k] = prev[k]
        }
      }
      return next
    })
  }, [rows])

  useEffect(() => {
    setPreviewChunkIdByRow((prev) => {
      const next = { ...prev }
      for (const row of rows) {
        const ids = resolveExamBlueprintChunkIds(row, chunks)
        if (ids.length === 0) {
          delete next[row.id]
          continue
        }
        const current = next[row.id]
        if (!current || !ids.includes(current)) {
          next[row.id] = ids[0]
        }
      }
      const rowIds = new Set(rows.map((r) => r.id))
      for (const key of Object.keys(next)) {
        if (!rowIds.has(key)) {
          delete next[key]
        }
      }
      return next
    })
  }, [rows, chunks])

  const blueprintSig = useMemo(
    () => blueprintSyncSignature(rows, chunks),
    [rows, chunks]
  )

  useEffect(() => {
    if (bulkSyncSignature !== null && blueprintSig !== bulkSyncSignature) {
      setGroupIdsByRowId({})
      setBulkSyncSignature(null)
      setLessonTestQuizzesByRowId({})
      quizFetchInFlightRef.current.clear()
      setQuizFetchLoadingRowIds({})
    }
  }, [blueprintSig, bulkSyncSignature])

  const updateRow = useCallback(
    (id: string, patch: Partial<ExamBlueprintRow>) => {
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))
    },
    []
  )

  const applyTargetTotal = useCallback((raw: number) => {
    setRows((prev) => {
      if (prev.length === 0) {
        return prev
      }
      const t = clampTargetTotalForGroups(raw, prev.length)
      setTargetTotal(t)
      return redistributeQuestionCountsToMatchTotal(prev, t)
    })
  }, [])

  const syncTargetTotalToGroupSums = useCallback(() => {
    setTargetTotal(
      clampTargetTotalForGroups(sumRowQuestionCounts, Math.max(1, rows.length))
    )
  }, [rows.length, sumRowQuestionCounts])

  const setRowChunkIds = useCallback(
    (rowId: string, nextIds: string[]) => {
      let ids = nextIds
      if (ids.length > MAX_CHUNKS_PER_LESSON_TEST_GROUP) {
        toast.warning('Mỗi nhóm tối đa 3 phân đoạn (giới hạn hệ thống).')
        ids = ids.slice(0, MAX_CHUNKS_PER_LESSON_TEST_GROUP)
      }
      if (ids.length === 0 && chunks[0]) {
        updateRow(rowId, { chunkIds: [chunks[0].id] })
        return
      }
      updateRow(rowId, { chunkIds: ids })
    },
    [chunks, updateRow]
  )

  const addRow = useCallback(() => {
    setRows((prev) => {
      const withNew = [...prev, makeEmptyExamBlueprintRow(chunks)]
      const t = clampTargetTotalForGroups(targetTotal, withNew.length)
      setTargetTotal(t)
      return redistributeQuestionCountsToMatchTotal(withNew, t)
    })
  }, [chunks, targetTotal])

  const removeRow = useCallback((id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) {
        return prev
      }
      const next = prev.filter((r) => r.id !== id)
      if (next.length === 0) {
        return prev
      }
      const t = clampTargetTotalForGroups(targetTotal, next.length)
      setTargetTotal(t)
      return redistributeQuestionCountsToMatchTotal(next, t)
    })
  }, [targetTotal])

  const commitGroupMeta = useCallback(
    async (
      rowId: string,
      patch: Pick<ExamBlueprintRow, 'groupTitle' | 'instruction' | 'questionCount'>
    ) => {
      const prevRow = rows.find((r) => r.id === rowId)
      if (!prevRow) return

      const merged: ExamBlueprintRow = {
        ...prevRow,
        ...patch,
        questionCount: clampQuestionCount(patch.questionCount),
      }

      updateRow(rowId, {
        groupTitle: merged.groupTitle,
        instruction: merged.instruction,
        questionCount: merged.questionCount,
      })

      const gid = groupIdsByRowId[rowId]
      if (!gid) {
        return
      }

      setSavingGroupRowId(rowId)
      try {
        const res = await lessonTestService.patchChunkGroup(gid, {
          label: merged.groupTitle.trim() || null,
          batchUserPrompt: merged.instruction.trim() || null,
          questionCount: merged.questionCount,
          chunkIds: resolveExamBlueprintChunkIds(merged, chunks),
        })
        if (res.code !== 200) {
          toast.error(res.message || 'Không lưu được nhóm.')
          throw new Error('patch_failed')
        }
        const nextRows = rows.map((r) => (r.id === rowId ? merged : r))
        setBulkSyncSignature(blueprintSyncSignature(nextRows, chunks))
        toast.success('Đã lưu thông tin nhóm.')
      } catch (e) {
        if (!(e instanceof Error && e.message === 'patch_failed')) {
          toast.error('Không lưu được nhóm.')
        }
        throw e
      } finally {
        setSavingGroupRowId(null)
      }
    },
    [chunks, groupIdsByRowId, rows, updateRow]
  )

  const runGenerate = useCallback(async () => {
    if (!isVip) {
      openVipDialog()
      return
    }
    if (!lessonId) {
      toast.error('Thiếu lessonId — không gọi được API.')
      return
    }
    if (!chunks.length) {
      toast.error('Chưa có phân đoạn nội dung. Hãy đợi phân tích xong trước.')
      return
    }

    if (!countsMatchTarget) {
      toast.error(
        `Tổng số câu ở các nhóm hiện là ${sumRowQuestionCounts} — cần khớp tổng câu cần tạo (${targetTotal}). Bấm "Đồng bộ tổng theo nhóm" bên tổng các nhóm hoặc chỉnh lại số.`
      )
      return
    }

    const valid = getValidExamBlueprintRows(rows, chunks)
    if (valid.length === 0) {
      toast.error('Vui lòng chọn ít nhất một phân đoạn và số câu (1–50) mỗi nhóm nội dung.')
      return
    }

    if (valid.some((r) => r.chunkIds.length > MAX_CHUNKS_PER_LESSON_TEST_GROUP)) {
      toast.error('Mỗi nhóm chỉ được chọn tối đa 3 phân đoạn.')
      return
    }

    setIsGenerating(true)
    const toastId = 'exam-blueprint'

    try {
      toast.loading(`Learnova AI đang lưu đề cương ôn tập cho bài học "${lessonTitle || '...'}"`, { id: toastId })

      const putRes = await lessonTestService.putLessonTest(lessonId, {
        status: LessonTestStatus.DRAFT,
        targetTotalQuestions: targetTotal,
      })
      if (putRes.code !== 200) {
        toast.dismiss(toastId)
        toast.error(putRes.message || 'Không lưu được đề cương kiểm tra.')
        setIsGenerating(false)
        return
      }
      setLessonTestHeaderStatus(LessonTestStatus.DRAFT)

      const existing = await lessonTestService.fetchLessonTestBundle(lessonId)
      if (existing?.chunkGroups?.length) {
        for (const g of existing.chunkGroups) {
          await lessonTestService.deleteChunkGroup(g.id)
        }
      }

      const mapping: Record<string, string> = {}
      for (let i = 0; i < valid.length; i += 1) {
        const row = valid[i]
        toast.loading(`Đang tạo nhóm ${i + 1}/${valid.length}…`, {
          id: toastId,
        })
        const created = await lessonTestService.createChunkGroup(lessonId, {
          chunkIds: row.chunkIds,
          questionCount: row.questionCount,
          label: row.groupTitle.trim() || `Nhóm nội dung ${i + 1}`,
          distribution: buildBatchDistributionForCount(row.questionCount),
          batchUserPrompt: row.instruction.trim() || null,
        })
        if (created.code !== 201 || !created.result?.id) {
          toast.dismiss(toastId)
          toast.error(created.message || 'Không tạo được nhóm nội dung.')
          setIsGenerating(false)
          onAfterGenerate?.()
          return
        }
        mapping[row.id] = created.result.id
      }

      toast.loading('Đang xếp hàng sinh câu cho tất cả nhóm…', { id: toastId })
      const bulk = await lessonTestService.postBulkGenerateLessonTestQuizzes(lessonId, {})
      if (bulk.code !== 202 || !bulk.result?.jobs?.length) {
        toast.dismiss(toastId)
        toast.error(bulk.message || 'Không xếp hàng sinh câu được.')
        setIsGenerating(false)
        onAfterGenerate?.()
        return
      }

      const jobIds = bulk.result.jobs.map((job: { jobId: string }) => job.jobId)
      const rowIdByGroupId: Record<string, string> = {}
      for (const [rowId, gid] of Object.entries(mapping)) {
        rowIdByGroupId[gid] = rowId
      }
      bulkHandledCompletedGroupIdsRef.current.clear()
      setLessonTestQuizzesByRowId({})

      toast.loading(`Learnova AI đang tạo các câu hỏi ôn tập cho bài học "${lessonTitle || '...'}"`, { id: toastId })
      const poll = await lessonTestService.pollBulkJobsUntilTerminal(lessonId, jobIds, {
        onSnapshot: async (items) => {
          for (const item of items) {
            if (
              item.status !== LessonTestJobSnapshotStatus.COMPLETED ||
              !item.groupId ||
              bulkHandledCompletedGroupIdsRef.current.has(item.groupId)
            ) {
              continue
            }
            bulkHandledCompletedGroupIdsRef.current.add(item.groupId)
            const rowId = rowIdByGroupId[item.groupId]
            if (!rowId) {
              bulkHandledCompletedGroupIdsRef.current.delete(item.groupId)
              continue
            }

            try {
              const quizRes = await lessonTestService.getChunkGroupQuizzes(item.groupId)
              const list =
                quizRes.code === 200 && Array.isArray(quizRes.result) ? quizRes.result : []
              setLessonTestQuizzesByRowId((prev) => ({ ...prev, [rowId]: list }))
              const labelIdx = valid.findIndex((v) => v.id === rowId) + 1
              toast.success(`Nhóm ${labelIdx}: đã sinh ${list.length} câu — hiển thị ngay bên dưới nhóm.`)
              refreshFlatLessonTestPreview()
            } catch {
              bulkHandledCompletedGroupIdsRef.current.delete(item.groupId)
            }
          }
        },
      })
      toast.dismiss(toastId)

      if (!poll.allOk) {
        toast.error(poll.failedReason || 'Sinh câu chưa hoàn tất.')
        setIsGenerating(false)
        onAfterGenerate?.()
        return
      }

      setGroupIdsByRowId(mapping)
      setBulkSyncSignature(blueprintSyncSignature(rows, chunks))
      toast.success(
        `Đã sinh câu kiểm tra cho ${valid.length} nhóm (đề ôn theo nhóm nội dung). Bạn có thể sinh lại từng nhóm bên dưới nếu cần.`
      )
      onAfterGenerate?.()
    } catch (e) {
      toast.dismiss(toastId)
      const ax = e as AxiosError<{ message?: string }>
      const msg =
        ax.response?.data?.message ||
        (e instanceof Error ? e.message : 'Lỗi kết nối. Thử lại sau.')
      toast.error(msg)
      onAfterGenerate?.()
    } finally {
      setIsGenerating(false)
      refreshFlatLessonTestPreview()
    }
  }, [
    chunks,
    countsMatchTarget,
    isVip,
    lessonId,
    onAfterGenerate,
    openVipDialog,
    refreshFlatLessonTestPreview,
    rows,
    sumRowQuestionCounts,
    targetTotal,
  ])

  const runRegenerateOneGroup = useCallback(
    async (rowId: string) => {
      if (!isVip) {
        openVipDialog()
        return
      }
      const groupId = groupIdsByRowId[rowId]
      if (!groupId || !lessonId) {
        toast.error('Chưa có nhóm đã lưu — hãy sinh câu theo các nhóm trước.')
        return
      }

      const row = rows.find((r) => r.id === rowId)
      const userPrompt = row?.instruction.trim() || undefined

      setSingleGroupRowId(rowId)
      const tid = `lesson-test-regen-${rowId}`
      try {
        toast.loading('Đang xếp hàng sinh lại câu cho nhóm này…', { id: tid })
        const acc = await lessonTestService.postGroupGenerateQuizzes(groupId, {
          userPrompt,
        })
        if (acc.code !== 202 || !acc.result?.jobId) {
          toast.dismiss(tid)
          toast.error(acc.message || 'Không xếp hàng sinh câu được.')
          return
        }

        toast.loading('Đang chờ AI sinh câu…', { id: tid })
        const wait = await lessonTestService.waitSingleGroupJob(groupId, acc.result.jobId)
        toast.dismiss(tid)

        if (!wait.ok) {
          toast.error(wait.message || 'Sinh câu thất bại.')
          return
        }

        try {
          const quizRes = await lessonTestService.getChunkGroupQuizzes(groupId)
          const list =
            quizRes.code === 200 && Array.isArray(quizRes.result) ? quizRes.result : []
          setLessonTestQuizzesByRowId((prev) => ({ ...prev, [rowId]: list }))
        } catch {
          /* keep UI without refreshed list */
        }

        toast.success('Đã sinh lại câu cho nhóm này.')
        onAfterGenerate?.()
      } catch (e) {
        toast.dismiss(tid)
        const ax = e as AxiosError<{ message?: string }>
        const msg =
          ax.response?.data?.message ||
          (e instanceof Error ? e.message : 'Lỗi kết nối. Thử lại sau.')
        toast.error(msg)
      } finally {
        setSingleGroupRowId(null)
        refreshFlatLessonTestPreview()
      }
    },
    [
      groupIdsByRowId,
      isVip,
      lessonId,
      onAfterGenerate,
      openVipDialog,
      refreshFlatLessonTestPreview,
      rows,
    ]
  )

  const handleToggleLessonTestPublish = useCallback(async () => {
    if (!lessonId) {
      toast.error('Thiếu lessonId.')
      return
    }
    if (!hasServerChunkGroups) {
      toast.error('Hãy lưu đề cương và sinh câu cho các nhóm trước khi xuất bản.')
      return
    }

    const isPublished = lessonTestHeaderStatus === LessonTestStatus.PUBLISHED
    if (isPublished) {
      const ok = await showConfirmToast({
        title: 'Chuyển bài kiểm tra về bản nháp?',
        description:
          'Học viên sẽ không còn truy cập bài kiểm tra này cho đến khi bạn xuất bản lại.',
        confirmLabel: 'Chuyển về bản nháp',
        cancelLabel: 'Hủy',
      })
      if (!ok) return
    }

    setPublishActionLoading(true)
    try {
      const next = isPublished ? LessonTestStatus.DRAFT : LessonTestStatus.PUBLISHED
      const res = await lessonTestService.putLessonTest(lessonId, { status: next })
      if (res.code !== 200 || !res.result) {
        toast.error(res.message || 'Không cập nhật trạng thái được.')
        return
      }
      setLessonTestHeaderStatus(res.result.status as LessonTestStatus)
      toast.success(
        next === LessonTestStatus.PUBLISHED
          ? 'Đã xuất bản. Học viên có thể làm bài kiểm tra.'
          : 'Đã chuyển về bản nháp.'
      )
      onAfterGenerate?.()
    } catch (e) {
      const ax = e as AxiosError<{ message?: string }>
      toast.error(ax.response?.data?.message || 'Không cập nhật trạng thái được.')
    } finally {
      setPublishActionLoading(false)
    }
  }, [hasServerChunkGroups, lessonId, lessonTestHeaderStatus, onAfterGenerate])

  if (!chunks.length) {
    return null
  }

  const onDeleteQuizClick = async (quizId: string, rowId: string) => {
    const ok = await showConfirmToast({
      title: 'Xóa câu hỏi này?',
      description: 'Hành động này sẽ xóa vĩnh viễn câu hỏi khỏi nhóm nội dung này.',
      confirmLabel: 'Xóa',
      cancelLabel: 'Hủy',
    })
    if (!ok) return

    try {
      const res = await quizService.deleteQuiz(quizId)
      if (res.code === 200) {
        setLessonTestQuizzesByRowId((prev) => ({
          ...prev,
          [rowId]: prev[rowId].filter((x) => x.id !== quizId),
        }))
        toast.success('Đã xóa câu hỏi.')
        refreshFlatLessonTestPreview()
      } else {
        toast.error(res.message || 'Không thể xóa câu hỏi.')
      }
    } catch (err) {
      toast.error('Lỗi khi xóa câu hỏi.')
    }
  }

  return (
    <div className='space-y-4'>
      <HighGlossBackground className='rounded-2xl shadow-lg shadow-blue-900/15 overflow-hidden'>
        <div className='px-4 py-3.5 md:px-5 md:py-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='flex items-center gap-3 md:gap-4 min-w-0 flex-1'>
            <div className='w-9 h-9 md:w-10 md:h-10 shrink-0 bg-white/10 rounded-xl flex items-center justify-center text-white shadow-md backdrop-blur-md border border-white/20'>
              <ClipboardList className='w-4 h-4 md:w-5 md:h-5' strokeWidth={2.25} />
            </div>
            <div className='min-w-0 flex flex-col pt-0 flex-1'>
              <h2 className='text-white font-bold text-[14px] md:text-[15px] tracking-tight leading-snug flex items-center gap-2 flex-wrap'>
                Bài kiểm tra theo từng mảng nội dung
                <Sparkles className='w-3 h-3 text-amber-200/90 shrink-0' aria-hidden />
              </h2>
              <p className='text-[10px] md:text-[11px] text-blue-100/80 mt-1 font-medium leading-snug max-w-xl'>
                Tổng câu toàn bài trước → nhóm phân đoạn → cách ra đề (bảng chuẩn đầu ra)
              </p>
              <div
                className='mt-2 self-start w-fit max-w-full inline-flex rounded-lg overflow-hidden border border-white/30 shadow-sm bg-white/[0.11] backdrop-blur-md'
                role='group'
                aria-label='Lesson test publication status and action'
              >
                <span
                  className={cn(
                    'inline-flex items-center justify-center shrink-0 h-9 px-2.5 sm:px-3 text-[10px] sm:text-[11px] font-semibold leading-none tracking-tight text-white whitespace-nowrap',
                    'border-r border-white/25',
                    lessonTestHeaderStatus === LessonTestStatus.PUBLISHED && 'bg-emerald-500/[0.22]',
                    lessonTestHeaderStatus === LessonTestStatus.ARCHIVED && 'bg-white/[0.08]',
                    lessonTestHeaderStatus === LessonTestStatus.DRAFT && 'bg-amber-400/[0.14]'
                  )}
                >
                  {lessonTestHeaderStatus === LessonTestStatus.PUBLISHED
                    ? 'Đã xuất bản'
                    : lessonTestHeaderStatus === LessonTestStatus.ARCHIVED
                      ? 'Đã lưu trữ'
                      : 'Bản nháp'}
                </span>
                <CustomButton
                  type='button'
                  variant='ghost'
                  label={
                    lessonTestHeaderStatus === LessonTestStatus.PUBLISHED
                      ? 'Chuyển về bản nháp'
                      : 'Xuất bản cho học viên'
                  }
                  icon={
                    publishActionLoading ? (
                      <Loader2 className='w-3.5 h-3.5 animate-spin' strokeWidth={2.25} />
                    ) : lessonTestHeaderStatus === LessonTestStatus.PUBLISHED ? (
                      <Undo2 className='w-3.5 h-3.5 shrink-0' strokeWidth={2.25} />
                    ) : (
                      <Rocket className='w-3.5 h-3.5 shrink-0' strokeWidth={2.25} />
                    )
                  }
                  className={cn(
                    'h-9 min-h-9 max-h-9 py-0 rounded-none rounded-r-lg px-2.5 sm:px-3 w-auto min-w-0',
                    'text-[10px] sm:text-[11px] font-semibold leading-none tracking-tight text-white hover:text-white',
                    'bg-white/5 hover:bg-white/18 active:bg-white/22',
                    'border-0 border-l border-white/20 shadow-none gap-1.5 justify-center',
                    '[&_span:first-child]:!mr-0 [&_span.mr-2]:!mr-0'
                  )}
                  disabled={isGenerating || publishActionLoading}
                  onClick={() => void handleToggleLessonTestPublish()}
                />
              </div>
            </div>
          </div>
          <div className='flex flex-col gap-2 shrink-0 w-full sm:w-auto sm:self-center lg:items-end'>
            {onBackToStructure ? (
              <CustomButton
                type='button'
                size='lg'
                variant='ghost'
                label='Quay lại cấu trúc bài giảng'
                icon={<ArrowLeft className='w-3.5 h-3.5 shrink-0' strokeWidth={2.25} />}
                className={[
                  'h-9 min-h-9 max-h-9 py-0 box-border rounded-lg px-3.5 sm:px-4',
                  'text-[11px] sm:text-[12px] leading-none font-bold whitespace-nowrap w-full sm:w-auto',
                  'bg-white/15 border border-white/25 text-white hover:bg-white/25 hover:text-white',
                  'shadow-none gap-2 [&_span:first-child]:!mr-0',
                ].join(' ')}
                onClick={onBackToStructure}
              />
            ) : null}
          </div>
        </div>
      </HighGlossBackground>

      {!showPreview && (
        <HighGlossBackground className='rounded-2xl shadow-lg shadow-blue-900/10'>
          <div className='rounded-[13px] bg-white p-4 md:p-6 space-y-4'>
            <LessonExamBlueprintHelpPanel />

            <LessonExamBlueprintTargetTotalCard
              chunkCount={chunks.length}
              targetTotal={targetTotal}
              onTargetTotalChange={applyTargetTotal}
              minTotal={minTotalForLayout}
              maxTotal={maxTotalForLayout}
              sumRowQuestionCounts={sumRowQuestionCounts}
              countsMatchTarget={countsMatchTarget}
              isGenerating={isGenerating}
              onSyncTargetToGroupSums={syncTargetTotalToGroupSums}
            />

            <div className='space-y-4 md:space-y-5'>
              {rows.map((row, index) => {
                const labelIdx = index + 1
                const selectChunkIds = resolveExamBlueprintChunkIds(row, chunks)
                const selectedChunks = getLessonChunksInSelectionOrder(chunks, selectChunkIds)
                const previewChunkId = previewChunkIdByRow[row.id] ?? selectChunkIds[0] ?? ''
                const previewChunk =
                  previewChunkId && selectedChunks.length
                    ? selectedChunks.find((c) => c.id === previewChunkId) ?? selectedChunks[0]
                    : null
                const previewPartIdx = previewChunk
                  ? chunks.findIndex((ch) => ch.id === previewChunk.id) + 1
                  : 0

                const isRowOpen = rowOpen[row.id] ?? index === 0
                const chunkLabels = selectedChunks.map((c) => {
                  const part = chunks.findIndex((ch) => ch.id === c.id) + 1
                  return c.title?.trim() || `Phân đoạn ${part}`
                })
                const chunkSummaryRaw =
                  chunkLabels.length === 0
                    ? 'Chưa chọn phân đoạn'
                    : chunkLabels.length === 1
                      ? chunkLabels[0]
                      : `${chunkLabels.length} phân đoạn: ${chunkLabels.join(', ')}`
                const chunkSummaryLine =
                  chunkSummaryRaw.length > 120
                    ? `${chunkSummaryRaw.slice(0, 119)}…`
                    : chunkSummaryRaw

                const isMetaInlineEditing = metaInlineEditRowId === row.id

                return (
                  <Collapsible
                    key={row.id}
                    open={isRowOpen}
                    onOpenChange={(open) => {
                      setRowOpen((prev) => ({ ...prev, [row.id]: open }))
                      if (open) void ensureQuizzesForRow(row.id)
                    }}
                  >
                    <HighGlossBackground className='rounded-xl overflow-hidden shadow-[0_8px_28px_-14px_rgba(30,58,138,0.22)]'>
                      <div
                        className={cn(
                          'flex gap-2 p-3 md:p-4',
                          isMetaInlineEditing ? 'items-start' : 'items-stretch',
                          isRowOpen && 'border-b border-white/10'
                        )}
                      >
                        {isMetaInlineEditing ? (
                          <>
                            <CollapsibleTrigger asChild>
                              <button
                                type='button'
                                className={cn(
                                  'flex shrink-0 items-center justify-center rounded-lg h-9 w-9 mt-0.5 outline-none',
                                  'focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-0'
                                )}
                                aria-expanded={isRowOpen}
                              >
                                <ChevronDown
                                  className={cn(
                                    'h-4 w-4 shrink-0 text-white transition-transform duration-200',
                                    isRowOpen ? 'rotate-0' : '-rotate-90'
                                  )}
                                  strokeWidth={2.25}
                                  aria-hidden
                                />
                              </button>
                            </CollapsibleTrigger>
                            <div className='rounded-xl bg-white/95 backdrop-blur-sm ring-1 ring-white/35 p-3 min-w-0 flex-1 shadow-sm'>
                              <LessonExamBlueprintRowMetaInlineEditor
                                rowId={row.id}
                                labelIdx={labelIdx}
                                groupTitle={row.groupTitle}
                                instruction={row.instruction}
                                questionCount={row.questionCount}
                                hasServerGroup={Boolean(groupIdsByRowId[row.id])}
                                disabled={isGenerating || rowOpsLocked}
                                isSaving={savingGroupRowId === row.id}
                                onCancel={() => setMetaInlineEditRowId(null)}
                                onCommit={async (rid, next) => {
                                  await commitGroupMeta(rid, next)
                                  setMetaInlineEditRowId(null)
                                }}
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <CollapsibleTrigger asChild>
                              <button
                                type='button'
                                className={cn(
                                  'flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left outline-none',
                                  'focus-visible:ring-2 focus-visible:ring-white/55 focus-visible:ring-offset-0'
                                )}
                              >
                                <ChevronDown
                                  className={cn(
                                    'mt-0.5 h-4 w-4 shrink-0 text-white transition-transform duration-200',
                                    isRowOpen ? 'rotate-0' : '-rotate-90'
                                  )}
                                  strokeWidth={2.25}
                                  aria-hidden
                                />
                                <div className='min-w-0 flex-1'>
                                  <span className='text-[12px] md:text-[13px] font-semibold text-white flex items-center gap-2 min-w-0'>
                                    <LayoutList
                                      className='w-4 h-4 shrink-0 text-blue-100'
                                      strokeWidth={2.25}
                                    />
                                    {row.groupTitle.trim() || `Nhóm nội dung ${labelIdx}`}
                                  </span>
                                  {!isRowOpen && (
                                    <p className='mt-1.5 text-[12px] leading-snug text-blue-100/95'>
                                      <span className='font-semibold text-white/95'>Phân đoạn: </span>
                                      <span className='text-white/90 [overflow-wrap:anywhere]'>{chunkSummaryLine}</span>
                                      <span className='ml-2 font-bold tabular-nums text-blue-200'>
                                        · {row.questionCount} câu
                                      </span>
                                    </p>
                                  )}
                                </div>
                              </button>
                            </CollapsibleTrigger>
                            <CustomButton
                              type='button'
                              variant='outline'
                              size='sm'
                              icon={<Pencil className='w-3.5 h-3.5' strokeWidth={2.25} />}
                              className='shrink-0 self-start h-7.5 w-7.5 md:h-8 md:w-8 p-0 font-bold border-2 border-white/35 text-white bg-white/15 hover:bg-white/25 hover:border-white/50 shadow-sm [&_span]:!mr-0'
                              onClick={(e) => {
                                e.stopPropagation()
                                setMetaInlineEditRowId(row.id)
                                setRowOpen((prev) => ({ ...prev, [row.id]: true }))
                              }}
                              disabled={isGenerating || rowOpsLocked}
                              aria-label='Chỉnh thông tin nhóm'
                            />
                          </>
                        )}
                        <CustomButton
                          type='button'
                          variant='outline'
                          size='sm'
                          icon={<Trash2 className='w-3.5 h-3.5' strokeWidth={2.5} />}
                          className='shrink-0 self-start h-7.5 w-7.5 md:h-8 md:w-8 p-0 font-bold border-2 border-red-300/80 text-red-100 bg-white/10 hover:bg-red-500/25 hover:text-white hover:border-red-200/90 shadow-sm [&_span]:!mr-0'
                          onClick={async (e) => {
                            e.stopPropagation()
                            const ok = await showConfirmToast({
                              title: 'Xóa nhóm cấu hình?',
                              description: `Bạn có chắc muốn xóa nhóm nội dung ${labelIdx}? Nếu nhóm đã được lưu, dữ liệu nhóm đó cũng sẽ bị xóa.`,
                              confirmLabel: 'Có, xóa',
                              cancelLabel: 'Hủy',
                            })
                            if (!ok) return
                            const gid = groupIdsByRowId[row.id]
                            if (gid) {
                              try {
                                await lessonTestService.deleteChunkGroup(gid)
                                toast.success('Đã xóa nhóm.')
                                setBulkSyncSignature(null)
                                onAfterGenerate?.()
                              } catch {
                                toast.error('Không xóa được nhóm.')
                                return
                              }
                            }
                            setGroupIdsByRowId((p) => {
                              const n = { ...p }
                              delete n[row.id]
                              return n
                            })
                            setLessonTestQuizzesByRowId((p) => {
                              const n = { ...p }
                              delete n[row.id]
                              return n
                            })
                            removeRow(row.id)
                          }}
                          disabled={
                            rows.length <= 1 ||
                            isGenerating ||
                            rowOpsLocked ||
                            isMetaInlineEditing
                          }
                          aria-label='Xóa nhóm cấu hình'
                        />
                      </div>

                      <CollapsibleContent>
                        <div className='space-y-3 bg-white px-3 md:px-4 pb-3 md:pb-4 pt-2'>
                          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch'>
                            <div className='space-y-1.5 min-w-0 flex flex-col'>
                              <Label className='text-[11px] md:text-[12px] font-semibold text-gray-600 flex items-center gap-1.5'>
                                <Layers className='w-3.5 h-3.5 text-blue-500' strokeWidth={2.5} />
                                Nhóm phân đoạn
                              </Label>
                              <MultiSelectSearch
                                options={chunkOptions}
                                value={selectChunkIds}
                                onChange={(next) => setRowChunkIds(row.id, next)}
                                placeholder='Chọn một hoặc nhiều phân đoạn…'
                                searchPlaceholder='Tìm phân đoạn…'
                                emptyText='Không tìm thấy phân đoạn.'
                                disabled={isGenerating || rowOpsLocked}
                                className='space-y-2 [&_button]:min-h-10 [&_button]:text-[13px] md:[&_button]:text-[14px] [&_button]:px-3.5 [&_button]:py-2.5 [&_button]:rounded-xl'
                              />
                              <p className='text-[11px] md:text-[12px] text-gray-500 font-medium leading-snug pl-0.5'>
                                Tối đa 3 phân đoạn mỗi nhóm; AI gộp ngữ cảnh và sinh câu theo đúng số câu nhóm. Tiêu đề, số câu và gợi ý ra đề chỉnh ngay trên thanh tiêu đề khi bấm{' '}
                                <span className='font-semibold text-gray-600'>bút chì</span>.
                              </p>
                            </div>

                            {selectedChunks.length > 0 && previewChunk && (
                              <div className='flex flex-col min-h-0 min-w-0 rounded-xl border border-blue-100/90 bg-blue-50/40 p-3 md:p-3.5 shadow-sm'>
                                <p className='text-[11px] md:text-[12px] font-semibold text-blue-800/90 flex items-center gap-1.5 shrink-0 mb-2'>
                                  <ScrollText className='w-3.5 h-3.5 shrink-0 text-blue-600' strokeWidth={2.5} />
                                  Xem tóm tắt
                                </p>
                                {selectedChunks.length > 1 ? (
                                  <div className='mb-2 space-y-1'>
                                    <Label
                                      htmlFor={`preview-${row.id}`}
                                      className='text-[10px] md:text-[11px] font-semibold text-blue-700/80'
                                    >
                                      Chọn phân đoạn để xem
                                    </Label>
                                    <Select
                                      value={previewChunk.id}
                                      onValueChange={(v) =>
                                        setPreviewChunkIdByRow((m) => ({ ...m, [row.id]: v }))
                                      }
                                      disabled={isGenerating || rowOpsLocked}
                                    >
                                      <SelectTrigger
                                        id={`preview-${row.id}`}
                                        size='sm'
                                        className='h-8 w-full text-[12px] md:text-[13px] font-medium border-blue-200/80 bg-white'
                                      >
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {selectedChunks.map((c) => {
                                          const pIdx = chunks.findIndex((ch) => ch.id === c.id) + 1
                                          return (
                                            <SelectItem
                                              key={c.id}
                                              value={c.id}
                                              className='text-[12px]'
                                            >
                                              {c.title || `Phân đoạn ${pIdx}`}
                                              {c.startTime ? ` · ${c.startTime}` : ''}
                                            </SelectItem>
                                          )
                                        })}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ) : null}
                                <div className='flex-1 min-h-[120px] max-h-[200px] overflow-y-auto rounded-lg border border-blue-100/80 bg-white/80 px-3 py-2.5'>
                                  <p className='text-[12px] md:text-[13px] font-bold text-gray-800 leading-snug'>
                                    {previewChunk.title || `Phân đoạn ${previewPartIdx || '?'}`}
                                    {previewChunk.startTime ? (
                                      <span className='font-medium text-blue-600/90 ml-1.5 text-[11px] md:text-[12px]'>
                                        · {previewChunk.startTime}
                                      </span>
                                    ) : null}
                                  </p>
                                  <p className='text-[12px] md:text-[13px] text-gray-600 leading-relaxed mt-1.5 [overflow-wrap:anywhere]'>
                                    {previewChunk.summary?.trim() || 'Chưa có tóm tắt cho phân đoạn này.'}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {quizFetchLoadingRowIds[row.id] ? (
                            <div className='flex items-center gap-2 mt-3 text-[12px] md:text-[13px] text-slate-600 px-1'>
                              <Loader2 className='w-4 h-4 shrink-0 animate-spin text-blue-600' />
                              Đang tải câu đề ôn…
                            </div>
                          ) : lessonTestQuizzesByRowId[row.id]?.length ? (
                            <div className='rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 mt-3 space-y-2.5'>
                              <p className='text-[12px] md:text-[13px] font-bold text-slate-900 flex items-center gap-2'>
                                <Sparkles className='w-3.5 h-3.5 text-blue-600' />
                                Câu đề ôn đã sinh ({lessonTestQuizzesByRowId[row.id].length})
                              </p>
                              <ul className='max-h-[260px] overflow-y-auto space-y-2 pr-1'>
                                {lessonTestQuizzesByRowId[row.id].map((q, qi) => (
                                  <li
                                    key={q.id}
                                    className='flex items-start gap-3 text-[12px] md:text-[13px] text-slate-800 leading-snug rounded-xl bg-white border border-slate-100 shadow-sm px-3 py-2.5 group/quiz'
                                  >
                                    <span className='font-bold text-blue-700 shrink-0 tabular-nums'>
                                      {qi + 1}.
                                    </span>
                                    <span className='flex-1 [overflow-wrap:anywhere] font-medium'>
                                      {q.question}
                                    </span>
                                    <CustomButton
                                      type='button'
                                      variant='ghost'
                                      size='sm'
                                      icon={<Trash2 className='w-3.5 h-3.5' />}
                                      className='h-7 w-7 p-0 opacity-0 group-hover/quiz:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0'
                                      onClick={() =>
                                        void onDeleteQuizClick(q.id, row.id)
                                      }
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ) : lessonTestQuizzesByRowId[row.id] &&
                            lessonTestQuizzesByRowId[row.id].length === 0 &&
                            groupIdsByRowId[row.id] ? (
                            <p className='text-[12px] md:text-[13px] text-slate-500 mt-4 px-1'>
                              Chưa có câu đề ôn cho nhóm này.
                            </p>
                          ) : null}

                          {groupIdsByRowId[row.id] ? (
                            <div className='pt-3 border-t border-slate-100 mt-3'>
                              <CustomButton
                                type='button'
                                variant='outline'
                                label={
                                  singleGroupRowId === row.id
                                    ? 'Đang sinh lại…'
                                    : 'Sinh lại nhóm này'
                                }
                                icon={
                                  singleGroupRowId === row.id ? undefined : (
                                    <RefreshCw
                                      className='w-3.5 h-3.5'
                                      strokeWidth={2.5}
                                    />
                                  )
                                }
                                className='h-8.5 text-[12px] md:text-[13px] font-bold border-slate-200 text-slate-700 bg-white hover:bg-slate-50 rounded-xl'
                                onClick={() => void runRegenerateOneGroup(row.id)}
                                disabled={
                                  isGenerating ||
                                  (singleGroupRowId !== null && singleGroupRowId !== row.id) ||
                                  (savingGroupRowId !== null && savingGroupRowId !== row.id)
                                }
                                isLoader={singleGroupRowId === row.id}
                              />
                              <p className='text-[10px] md:text-[11px] text-gray-500 mt-2 leading-snug'>
                                Hiện sau khi bạn đã sinh câu theo tất cả nhóm; gửi kèm “Cách ra đề” của nhóm (nếu có).
                              </p>
                            </div>
                          ) : null}
                        </div>
                      </CollapsibleContent>
                    </HighGlossBackground>
                  </Collapsible>
                )
              })}
            </div>

            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1 border-t border-gray-100/80 mt-1'>
              <CustomButton
                type='button'
                variant='outline'
                label='Thêm nhóm nội dung'
                icon={<Plus className='w-3.5 h-3.5' strokeWidth={2.5} />}
                className='h-8 font-bold border-dashed border-gray-200 text-gray-600 bg-gray-50/50 hover:bg-white rounded-xl'
                onClick={addRow}
                disabled={isGenerating || rowOpsLocked}
              />
              <div className='flex items-center gap-2'>
                {hasServerChunkGroups && (
                  <CustomButton
                    type='button'
                    variant='outline'
                    label='Xem toàn bài'
                    icon={<Eye className='w-3.5 h-3.5' />}
                    className='h-8 font-bold border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-50 rounded-xl px-4'
                    onClick={() => setShowPreview(true)}
                  />
                )}
                <CustomButton
                  type='button'
                  label={
                    isGenerating
                      ? 'Đang tạo…'
                      : isVip
                        ? 'Sinh câu theo các nhóm nội dung'
                        : 'Nâng VIP để sinh câu'
                  }
                  icon={
                    isGenerating ? (
                      <Loader2 className='w-3.5 h-3.5 animate-spin' />
                    ) : (
                      <Sparkles className='w-3.5 h-3.5' />
                    )
                  }
                  className='h-8 font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-md shadow-blue-100'
                  onClick={() => void runGenerate()}
                  disabled={
                    isGenerating ||
                    !countsMatchTarget ||
                    rowOpsLocked
                  }
                />
              </div>
            </div>
          </div>
        </HighGlossBackground>
      )}

      <LessonExamBlueprintTestPreviewPanel
        visible={showPreview && hasServerChunkGroups}
        onBack={() => setShowPreview(false)}
        loading={flatLessonTestPreviewLoading}
        quizzes={flatLessonTestQuizzes}
        chunks={chunks}
        handleSeek={handleSeek}
        testTitle={flatLessonTestTitleFromApi ?? persistedLessonTest?.title ?? null}
        lessonType={lessonType}
      />
    </div>
  )
}

export default LessonExamBlueprintSection
