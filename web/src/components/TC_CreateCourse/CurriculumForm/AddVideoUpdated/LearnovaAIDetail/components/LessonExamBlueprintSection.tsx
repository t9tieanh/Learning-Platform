import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ChevronDown,
  ClipboardList,
  Hash,
  Layers,
  LayoutList,
  Loader2,
  PenLine,
  Plus,
  ScrollText,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import CustomButton from '@/components/common/Button'
import MultiSelectSearch from '@/components/common/MultiSelectSearch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
import quizService from '@/services/assistant/quiz.service'
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
  normalizeExamBlueprintRowsWhenChunksChange,
  redistributeQuestionCountsToMatchTotal,
  resolveExamBlueprintChunkIds,
  splitQuestionCountAcrossChunks,
} from '../utils/lessonExamBlueprint.utils'

export type { ExamBlueprintRow } from '../utils/lessonExamBlueprint.utils'

interface LessonExamBlueprintSectionProps {
  chunks: LessonChunk[]
  onAfterGenerate?: () => void
}

/** Section: map chunks to config groups, target total, then batch-generate quizzes per group (VIP). */
const LessonExamBlueprintSection: React.FC<LessonExamBlueprintSectionProps> = ({
  chunks,
  onAfterGenerate,
}) => {
  const { openVipDialog } = useVipUpgrade()
  const { data: authData } = useAuthStore()
  const isVip = authData?.isVip ?? false

  const chunkOptions = useMemo(
    () => buildLessonChunkMultiSelectOptions(chunks),
    [chunks]
  )

  const [rows, setRows] = useState<ExamBlueprintRow[]>(() =>
    buildDefaultExamBlueprintRows(chunks)
  )
  const [targetTotal, setTargetTotal] = useState(() =>
    getDefaultTargetTotalQuestionCount(chunks)
  )
  const [isGenerating, setIsGenerating] = useState(false)
  /** Per group row: which chunk’s summary is shown in the preview (must be in that row’s selected chunks). */
  const [previewChunkIdByRow, setPreviewChunkIdByRow] = useState<Record<string, string>>({})
  /** Whether each config group card is expanded; missing key → first group defaults to open. */
  const [rowOpen, setRowOpen] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setRows((prev) => {
      const next = normalizeExamBlueprintRowsWhenChunksChange(prev, chunks)
      if (!prev.length && next.length) {
        const sum = next.reduce((s, r) => s + r.questionCount, 0)
        queueMicrotask(() => {
          setTargetTotal(
            clampTargetTotalForGroups(sum, next.length)
          )
        })
      }
      return next
    })
  }, [chunks])

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
      if (nextIds.length === 0 && chunks[0]) {
        updateRow(rowId, { chunkIds: [chunks[0].id] })
        return
      }
      updateRow(rowId, { chunkIds: nextIds })
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

  const runGenerate = useCallback(async () => {
    if (!isVip) {
      openVipDialog()
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

    setIsGenerating(true)
    let ok = 0

    for (const row of valid) {
      const chunkIds = row.chunkIds
      const perChunk = splitQuestionCountAcrossChunks(
        row.questionCount,
        chunkIds.length
      )
      const userPrompt = row.instruction.trim() || undefined

      for (let i = 0; i < chunkIds.length; i += 1) {
        const cnt = perChunk[i] ?? 0
        if (cnt < 1) {
          continue
        }
        const distribution = buildBatchDistributionForCount(cnt)
        try {
          toast.loading(
            `Đang tạo ${cnt} câu — nhóm phân đoạn ${i + 1}/${chunkIds.length} (trong cấu hình)…`,
            { id: 'exam-blueprint' }
          )
          const res = await quizService.generateBatchQuizzes(chunkIds[i], {
            count: cnt,
            distribution,
            userPrompt,
          })
          if (res.code !== 201) {
            toast.dismiss('exam-blueprint')
            toast.error(res.message || 'Có bước chưa tạo được câu hỏi')
            setIsGenerating(false)
            onAfterGenerate?.()
            return
          }
        } catch (e) {
          toast.dismiss('exam-blueprint')
          toast.error(e instanceof Error ? e.message : 'Lỗi mạng hoặc máy chủ')
          setIsGenerating(false)
          onAfterGenerate?.()
          return
        }
      }
      ok += 1
    }

    toast.dismiss('exam-blueprint')
    toast.success(
      `Đã tạo câu hỏi theo ${ok} nhóm cấu hình. Mở từng phân đoạn bên trên để xem.`
    )
    onAfterGenerate?.()
    setIsGenerating(false)
  }, [
    chunks,
    countsMatchTarget,
    isVip,
    onAfterGenerate,
    openVipDialog,
    rows,
    sumRowQuestionCounts,
    targetTotal,
  ])

  if (!chunks.length) {
    return null
  }

  return (
    <div className='space-y-4'>
      <HighGlossBackground className='rounded-2xl shadow-xl border border-blue-400/20 overflow-hidden'>
        <div className='px-6 py-5 md:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
          <div className='flex items-center gap-4 md:gap-5 min-w-0'>
            <div className='w-10 h-10 md:w-12 md:h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white shadow-xl backdrop-blur-md border border-white/20 shrink-0'>
              <ClipboardList className='w-5 h-5 md:w-6 md:h-6' strokeWidth={2.25} />
            </div>
            <div className='min-w-0 flex flex-col'>
              <h2 className='text-white font-bold text-[15px] md:text-[16px] tracking-tight leading-tight flex items-center gap-2 flex-wrap'>
                Bài kiểm tra theo từng mảng nội dung
                <Sparkles className='w-3 h-3 text-amber-200/90 shrink-0' aria-hidden />
              </h2>
              <p className='text-[10px] md:text-[11px] text-blue-100/70 mt-1 font-medium leading-snug'>
                Tổng câu toàn bài trước → nhóm phân đoạn → cách ra đề (bảng chuẩn đầu ra)
              </p>
            </div>
          </div>
        </div>
      </HighGlossBackground>

      <div className='rounded-2xl border border-gray-100 bg-white/80 backdrop-blur-sm shadow-sm p-4 md:p-6 space-y-4'>
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

            return (
              <Collapsible
                key={row.id}
                open={isRowOpen}
                onOpenChange={(open) =>
                  setRowOpen((prev) => ({ ...prev, [row.id]: open }))
                }
              >
                <div
                  className={cn(
                    'rounded-xl border border-blue-200/50 shadow-md shadow-blue-100/20',
                    'border-l-[4px] border-l-blue-600 ring-1 ring-blue-100/40',
                    'overflow-hidden bg-gradient-to-b from-blue-50/45 via-white to-indigo-50/20'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-stretch gap-2 p-3 md:p-4 bg-blue-50/50',
                      isRowOpen && 'border-b border-blue-100/80'
                    )}
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type='button'
                        className={cn(
                          'flex min-w-0 flex-1 items-start gap-2 rounded-lg text-left outline-none',
                          'focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-2'
                        )}
                      >
                        <ChevronDown
                          className={cn(
                            'mt-0.5 h-4 w-4 shrink-0 text-blue-600 transition-transform duration-200',
                            isRowOpen ? 'rotate-0' : '-rotate-90'
                          )}
                          strokeWidth={2.25}
                          aria-hidden
                        />
                        <div className='min-w-0 flex-1'>
                          <span className='text-[12px] md:text-[13px] font-semibold text-gray-800 flex items-center gap-2 min-w-0'>
                            <LayoutList
                              className='w-4 h-4 shrink-0 text-blue-600'
                              strokeWidth={2.25}
                            />
                            Nhóm nội dung {labelIdx}
                          </span>
                          {!isRowOpen && (
                            <p className='mt-1.5 text-[12px] leading-snug text-gray-600'>
                              <span className='font-semibold text-gray-700'>Phân đoạn: </span>
                              <span className='[overflow-wrap:anywhere]'>{chunkSummaryLine}</span>
                              <span className='ml-2 font-bold tabular-nums text-blue-700'>
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
                      icon={<Trash2 className='w-3.5 h-3.5' strokeWidth={2.5} />}
                      className='shrink-0 self-start h-8 w-8 md:h-9 md:w-9 p-0 font-bold border-2 border-red-300 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 hover:border-red-400 shadow-sm [&_span]:!mr-0'
                      onClick={async (e) => {
                        e.stopPropagation()
                        const ok = await showConfirmToast({
                          title: 'Xóa nhóm cấu hình?',
                          description: `Bạn có chắc muốn xóa nhóm nội dung ${labelIdx} (cấu hình số câu và phân đoạn)? Bạn vẫn có thể thêm nhóm mới sau đó.`,
                          confirmLabel: 'Có, xóa',
                          cancelLabel: 'Hủy',
                        })
                        if (ok) {
                          removeRow(row.id)
                        }
                      }}
                      disabled={rows.length <= 1 || isGenerating}
                      aria-label='Xóa nhóm cấu hình'
                    />
                  </div>

                  <CollapsibleContent>
                    <div className='space-y-3 border-t border-blue-100/70 px-3 md:px-4 pb-3 md:pb-4 pt-2'>
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
                      disabled={isGenerating}
                      className='space-y-2 [&_button]:min-h-10 [&_button]:text-[13px] md:[&_button]:text-[14px] [&_button]:px-3.5 [&_button]:py-2.5 [&_button]:rounded-xl'
                    />
                    <p className='text-[11px] md:text-[12px] text-gray-500 font-medium leading-snug pl-0.5'>
                      Nhiều phân đoạn: số câu nhóm được chia tự động cho từng phân đoạn.
                    </p>
                    <div className='space-y-1.5 pt-2 max-w-full sm:max-w-[200px]'>
                      <Label
                        htmlFor={`count-${row.id}`}
                        className='text-[11px] md:text-[12px] font-semibold text-gray-600 flex items-center gap-1.5'
                      >
                        <Hash className='w-3.5 h-3.5 text-violet-500' strokeWidth={2.5} />
                        Số câu nhóm này
                      </Label>
                      <Input
                        id={`count-${row.id}`}
                        type='number'
                        min={1}
                        max={50}
                        value={row.questionCount}
                        onChange={(e) => {
                          const n = parseInt(e.target.value, 10)
                          if (Number.isNaN(n)) {
                            return
                          }
                          updateRow(row.id, { questionCount: clampQuestionCount(n) })
                        }}
                        disabled={isGenerating}
                        className='h-10 text-[13px] md:text-[14px] font-semibold border-gray-200 bg-white w-full'
                      />
                    </div>
                  </div>

                  {selectedChunks.length > 0 && previewChunk && (
                    <div className='flex flex-col min-h-0 min-w-0 rounded-xl border border-sky-100/90 bg-sky-50/40 p-3 md:p-3.5 shadow-sm'>
                      <p className='text-[11px] md:text-[12px] font-semibold text-sky-800/90 flex items-center gap-1.5 shrink-0 mb-2'>
                        <ScrollText className='w-3.5 h-3.5 shrink-0' strokeWidth={2.5} />
                        Xem tóm tắt
                      </p>
                      {selectedChunks.length > 1 ? (
                        <div className='mb-2 space-y-1'>
                          <Label
                            htmlFor={`preview-${row.id}`}
                            className='text-[10px] md:text-[11px] font-semibold text-sky-700/80'
                          >
                            Chọn phân đoạn để xem
                          </Label>
                          <Select
                            value={previewChunk.id}
                            onValueChange={(v) =>
                              setPreviewChunkIdByRow((m) => ({ ...m, [row.id]: v }))
                            }
                            disabled={isGenerating}
                          >
                            <SelectTrigger
                              id={`preview-${row.id}`}
                              size='sm'
                              className='h-9 w-full text-[12px] md:text-[13px] font-medium border-sky-200/80 bg-white'
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
                      <div className='flex-1 min-h-[120px] max-h-[200px] overflow-y-auto rounded-lg border border-sky-100/80 bg-white/80 px-3 py-2.5'>
                        <p className='text-[12px] md:text-[13px] font-bold text-gray-800 leading-snug'>
                          {previewChunk.title || `Phân đoạn ${previewPartIdx || '?'}`}
                          {previewChunk.startTime ? (
                            <span className='font-medium text-sky-600/90 ml-1.5 text-[11px] md:text-[12px]'>
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

                <div className='space-y-1.5 pt-0.5 border-t border-blue-100/60'>
                  <Label
                    htmlFor={`hint-${row.id}`}
                    className='text-[11px] md:text-[12px] font-semibold text-gray-600 flex items-center gap-1.5'
                  >
                    <PenLine className='w-3.5 h-3.5 text-emerald-500' strokeWidth={2.5} />
                    Cách ra đề (gợi ý cho AI)
                  </Label>
                  <Textarea
                    id={`hint-${row.id}`}
                    rows={3}
                    placeholder='Ví dụ: ưu tiên trắc nghiệm; cô đọng; gắn mục tiêu [G1.1]…'
                    value={row.instruction}
                    onChange={(e) => updateRow(row.id, { instruction: e.target.value })}
                    disabled={isGenerating}
                    className='w-full min-h-[88px] text-[13px] md:text-[14px] leading-relaxed border-gray-200 bg-white resize-y placeholder:text-gray-400'
                  />
                </div>
                    </div>
                  </CollapsibleContent>
                </div>
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
            className='h-10 text-[12px] md:text-[13px] font-bold border-dashed border-gray-200 text-gray-600 bg-gray-50/50 hover:bg-white rounded-xl'
            onClick={addRow}
            disabled={isGenerating}
          />
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
            className='font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 shadow-md shadow-blue-100'
            onClick={runGenerate}
            disabled={isGenerating || !countsMatchTarget}
          />
        </div>
      </div>
    </div>
  )
}

export default LessonExamBlueprintSection
