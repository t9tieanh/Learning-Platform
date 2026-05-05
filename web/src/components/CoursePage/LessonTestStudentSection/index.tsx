import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { ClipboardList, History, Loader2, PencilLine, RefreshCw, SendHorizontal } from 'lucide-react'
import { toast } from 'sonner'
import CustomButton from '@/components/common/Button'
import lessonTestStudentService from '@/services/assistant/lesson-test-student.service'
import { useLessonTestDraftStore } from '@/stores/useLessonTestDraft.stores'
import type { LessonTestSubmissionResult, StudentLessonTestView } from '@/types/lesson-test-student.type'
import { LessonTestChunkGroups } from './LessonTestChunkGroups'
import { LessonTestHistoryPanel } from './LessonTestHistoryPanel'
import { LessonTestHero } from './LessonTestHero'
import { LessonTestQuestionNavDesktop, LessonTestQuestionNavMobile } from './LessonTestQuestionMap'
import {
  buildQuestionNavItems,
  getLessonTestErrorMessage,
  lessonTestViewFingerprint,
} from './utils'
import { cn } from '@/lib/utils'

type StudentSectionTab = 'take' | 'history'

function LessonTestSectionModeTabs({
  sectionTab,
  setSectionTab,
}: {
  sectionTab: StudentSectionTab
  setSectionTab: (t: StudentSectionTab) => void
}) {
  return (
    <div
      className='flex rounded-xl bg-gray-100/90 p-0.5 w-full sm:w-fit gap-0.5'
      role='tablist'
      aria-label='Chế độ bài kiểm tra'
    >
      <CustomButton
        type='button'
        variant='ghost'
        role='tab'
        aria-selected={sectionTab === 'take'}
        size='sm'
        label='Làm bài'
        icon={<PencilLine className='w-3.5 h-3.5 shrink-0' aria-hidden />}
        className={cn(
          'flex-1 sm:flex-none rounded-[10px] text-[11px] font-bold tracking-wide min-h-[2.25rem] h-auto py-2 shadow-none',
          sectionTab === 'take'
            ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 text-white shadow-sm shadow-blue-900/20 hover:bg-gradient-to-br hover:from-blue-600 hover:via-blue-700 hover:to-indigo-950 hover:text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/90'
        )}
        onClick={() => setSectionTab('take')}
      />
      <CustomButton
        type='button'
        variant='ghost'
        role='tab'
        aria-selected={sectionTab === 'history'}
        size='sm'
        label='Lịch sử'
        icon={<History className='w-3.5 h-3.5 shrink-0' aria-hidden />}
        className={cn(
          'flex-1 sm:flex-none rounded-[10px] text-[11px] font-bold tracking-wide min-h-[2.25rem] h-auto py-2 shadow-none',
          sectionTab === 'history'
            ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-950 text-white shadow-sm shadow-blue-900/20 hover:bg-gradient-to-br hover:from-blue-600 hover:via-blue-700 hover:to-indigo-950 hover:text-white'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/90'
        )}
        onClick={() => setSectionTab('history')}
      />
    </div>
  )
}

export interface LessonTestStudentSectionProps {
  lessonId: string
  initialView?: StudentLessonTestView | null
  onPrefetchRefresh?: (view: StudentLessonTestView) => void
}

const LessonTestStudentSection: React.FC<LessonTestStudentSectionProps> = ({
  lessonId,
  initialView = null,
  onPrefetchRefresh,
}) => {
  const setLessonDraft = useLessonTestDraftStore((s) => s.setLessonDraft)
  const clearLessonDraft = useLessonTestDraftStore((s) => s.clearLessonDraft)

  const [view, setView] = useState<StudentLessonTestView | null>(() => initialView ?? null)
  const [loading, setLoading] = useState(() => initialView == null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [historyHint, setHistoryHint] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<LessonTestSubmissionResult | null>(null)
  const [flaggedIds, setFlaggedIds] = useState<Record<string, boolean>>({})
  const [sectionTab, setSectionTab] = useState<StudentSectionTab>('take')

  const allQuizzes = useMemo(() => {
    if (!view?.chunkGroups?.length) return []
    return view.chunkGroups.flatMap((g) => g.quizzes)
  }, [view])

  const load = useCallback(
    async (opts?: { fresh?: boolean }) => {
      const fresh = opts?.fresh ?? false
      if (fresh) {
        clearLessonDraft(lessonId)
      }
      setLoading(true)
      setLoadError(null)
      setHistoryHint(null)
      setResult(null)
      setAnswers({})
      setFlaggedIds({})
      try {
        const res = await lessonTestStudentService.getStudentLessonTest(lessonId)
        if (res.code === 200 && res.result) {
          const v = res.result
          setView(v)
          onPrefetchRefresh?.(v)
          const fp = lessonTestViewFingerprint(v)
          if (!fresh) {
            const draft = useLessonTestDraftStore.getState().draftByLessonId[lessonId]
            if (draft?.fingerprint === fp) {
              setAnswers(draft.answers)
              setFlaggedIds(draft.flaggedIds)
            }
          }
        } else {
          setLoadError(res.message || 'Không tải được bài kiểm tra.')
          setView(null)
          setHistoryHint('Bạn vẫn có thể xem lịch sử các lần nộp bài (nếu có) ở tab « Lịch sử ».')
        }
      } catch (e) {
        setLoadError(getLessonTestErrorMessage(e))
        setView(null)
        setHistoryHint('Bạn vẫn có thể xem lịch sử các lần nộp bài (nếu có) ở tab « Lịch sử ».')
      } finally {
        setLoading(false)
      }
    },
    [lessonId, onPrefetchRefresh, clearLessonDraft]
  )

  useEffect(() => {
    if (initialView != null) {
      setView(initialView)
      setLoadError(null)
      setHistoryHint(null)
      setLoading(false)
      setResult(null)
      const fp = lessonTestViewFingerprint(initialView)
      const draft = useLessonTestDraftStore.getState().draftByLessonId[lessonId]
      if (draft?.fingerprint === fp) {
        setAnswers(draft.answers)
        setFlaggedIds(draft.flaggedIds)
      } else {
        setAnswers({})
        setFlaggedIds({})
      }
      return
    }
    void load()
  }, [lessonId, initialView, load])

  useEffect(() => {
    if (!view || result || loading) return
    const fingerprint = lessonTestViewFingerprint(view)
    setLessonDraft(lessonId, { fingerprint, answers, flaggedIds })
  }, [lessonId, view, result, loading, answers, flaggedIds, setLessonDraft])

  const setChoice = (quizId: string, choiceId: string) => {
    setAnswers((prev) => ({ ...prev, [quizId]: choiceId ? [choiceId] : [] }))
  }

  const handleSubmit = async () => {
    if (!view || allQuizzes.length === 0) return
    const payload = allQuizzes.map((q) => ({
      quizId: q.id,
      selectedChoiceIds: answers[q.id] ?? [],
    }))
    setSubmitting(true)
    try {
      const res = await lessonTestStudentService.submit(lessonId, payload)
      if (res.code === 200 && res.result) {
        setResult(res.result)
        clearLessonDraft(lessonId)
        toast.success(`Đã nộp bài: ${res.result.summary.earnedPoints}/${res.result.summary.maxPoints} điểm`)
      } else {
        toast.error(res.message || 'Nộp bài thất bại.')
      }
    } catch (e) {
      toast.error(getLessonTestErrorMessage(e))
    } finally {
      setSubmitting(false)
    }
  }

  const resultByQuizId = useMemo(() => {
    if (!result?.items?.length) {
      return new Map<string, LessonTestSubmissionResult['items'][0]>()
    }
    return new Map(result.items.map((it) => [it.quizId, it]))
  }, [result])

  const submissionCorrectCount = useMemo(() => {
    if (!result?.items?.length) return 0
    return result.items.filter((i) => i.isCorrect).length
  }, [result])

  const questionNavItems = useMemo(() => buildQuestionNavItems(view), [view])

  const toggleFlag = useCallback((quizId: string) => {
    if (result) return
    setFlaggedIds((prev) => ({ ...prev, [quizId]: !prev[quizId] }))
  }, [result])

  const mapState = useMemo(
    () => ({
      questionNavItems,
      flaggedIds,
      answers,
      resultByQuizId,
      lockedAll: Boolean(result),
    }),
    [questionNavItems, flaggedIds, answers, resultByQuizId, result]
  )

  if (loading) {
    return (
      <div className='py-8 flex flex-col items-center justify-center min-h-[280px] gap-3 animate-in fade-in duration-500'>
        <Loader2 className='w-8 h-8 animate-spin text-blue-600' />
        <p className='text-[12.5px] font-medium text-gray-500'>Đang tải bài kiểm tra…</p>
      </div>
    )
  }

  if (loadError && !view) {
    return (
      <div className='py-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <LessonTestHero />

        <LessonTestSectionModeTabs sectionTab={sectionTab} setSectionTab={setSectionTab} />

        {sectionTab === 'history' ? (
          <div className='relative group'>
            <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000' />
            <div className='relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible p-4 md:p-6'>
              <LessonTestHistoryPanel lessonId={lessonId} />
            </div>
          </div>
        ) : (
          <div className='rounded-[2rem] border border-gray-100 bg-white px-8 py-12 text-center space-y-4 shadow-sm'>
            <ClipboardList className='w-10 h-10 mx-auto text-gray-300' />
            <p className='text-[12.5px] font-medium text-gray-600 max-w-md mx-auto leading-relaxed'>{loadError}</p>
            {historyHint ? (
              <p className='text-[11px] text-gray-500 max-w-md mx-auto leading-relaxed'>{historyHint}</p>
            ) : null}
            <CustomButton
              type='button'
              variant='outline'
              label='Thử lại'
              icon={<RefreshCw className='w-3.5 h-3.5' />}
              className='h-9 text-[11px] font-bold tracking-[0.1em]'
              onClick={() => void load()}
            />
          </div>
        )}
      </div>
    )
  }

  if (!view) {
    return (
      <div className='py-4 animate-in fade-in slide-in-from-bottom-4 duration-700'>
        <div className='rounded-[2rem] border border-gray-100 bg-white px-8 py-12 text-center space-y-4 shadow-sm'>
          <ClipboardList className='w-10 h-10 mx-auto text-gray-300' />
          <p className='text-[12.5px] font-medium text-gray-600 max-w-md mx-auto leading-relaxed'>
            Không có dữ liệu.
          </p>
          <CustomButton
            type='button'
            variant='outline'
            label='Thử lại'
            icon={<RefreshCw className='w-3.5 h-3.5' />}
            className='h-9 text-[11px] font-bold tracking-[0.1em]'
            onClick={() => void load()}
          />
        </div>
      </div>
    )
  }

  const { lessonTest, chunkGroups } = view
  const totalQuestions = allQuizzes.length
  const lessonTitleLine = lessonTest.title?.trim() || 'Bài kiểm tra bài học'

  return (
    <div className='py-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-700'>
      <LessonTestHero />

      <LessonTestSectionModeTabs sectionTab={sectionTab} setSectionTab={setSectionTab} />

      {sectionTab === 'history' ? (
        <div className='relative group'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000' />
          <div className='relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible p-4 md:p-6'>
            <LessonTestHistoryPanel lessonId={lessonId} />
          </div>
        </div>
      ) : (
        <div className='relative group'>
          <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000' />
          <div className='relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible'>
            <div className='p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-6 lg:gap-5 lg:items-start'>
              <div className='min-w-0 space-y-6 md:space-y-8'>
                <LessonTestQuestionNavMobile {...mapState} />

                {result ? (
                  <div className='rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50/40 px-4 py-3.5 shadow-sm shadow-gray-900/[0.03]'>
                    <p className='text-[10px] font-bold tracking-wider text-gray-500'>
                      Thống kê lần nộp này
                    </p>
                    <div className='mt-2.5 flex flex-wrap items-end gap-x-6 gap-y-3'>
                      <div className='min-w-0'>
                        <p className='text-[26px] font-black tabular-nums text-[#0C356A] leading-none tracking-tight'>
                          {result.summary.percent}%
                        </p>
                        <p className='text-[10.5px] font-semibold text-gray-500 mt-1.5'>Tỷ lệ</p>
                      </div>
                      <div
                        className='hidden sm:block w-px h-11 bg-gray-200/90 shrink-0'
                        aria-hidden
                      />
                      <div className='min-w-0'>
                        <p className='text-lg font-bold tabular-nums text-gray-900 leading-none'>
                          {result.summary.earnedPoints}
                          <span className='text-gray-400 font-semibold text-base'>
                            /{result.summary.maxPoints}
                          </span>
                        </p>
                        <p className='text-[10.5px] font-semibold text-gray-500 mt-1.5'>Điểm</p>
                      </div>
                      <div className='min-w-0 sm:pl-1'>
                        <p className='text-lg font-bold tabular-nums text-gray-900 leading-none'>
                          {submissionCorrectCount}
                          <span className='text-gray-400 font-semibold text-base'>/{totalQuestions}</span>
                        </p>
                        <p className='text-[10.5px] font-semibold text-gray-500 mt-1.5'>Câu đúng</p>
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className='border-b border-gray-100 pb-4'>
                  <h3 className='text-[#0C356A] font-semibold text-[13px] tracking-tight leading-snug'>
                    {lessonTitleLine}
                  </h3>
                  <p className='text-[10px] text-gray-400 mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-bold tracking-wider'>
                    <span>
                      {totalQuestions} câu · {chunkGroups.length} phần
                    </span>
                  </p>
                </div>

                <LessonTestChunkGroups
                  chunkGroups={chunkGroups}
                  answers={answers}
                  setChoice={setChoice}
                  result={result}
                  resultByQuizId={resultByQuizId}
                  flaggedIds={flaggedIds}
                  toggleFlag={toggleFlag}
                />

                <div className='flex flex-wrap gap-3 justify-end pt-2 border-t border-gray-100'>
                  {result ? (
                    <CustomButton
                      type='button'
                      variant='outline'
                      label='Làm lại (đề mới)'
                      icon={<RefreshCw className='w-3.5 h-3.5' />}
                      className='h-9 text-[11px] font-bold tracking-[0.1em] rounded-lg border-gray-200'
                      onClick={() => void load({ fresh: true })}
                    />
                  ) : (
                    <CustomButton
                      type='button'
                      label='Nộp bài'
                      icon={
                        submitting ? undefined : <SendHorizontal className='w-3.5 h-3.5' />
                      }
                      isLoader={submitting}
                      disabled={submitting || allQuizzes.length === 0}
                      className='bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-6 h-9 text-[11px] font-bold tracking-[0.1em] shadow-sm shadow-blue-100'
                      onClick={() => void handleSubmit()}
                    />
                  )}
                </div>
              </div>

              <LessonTestQuestionNavDesktop {...mapState} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { LessonTestStudentSection }
