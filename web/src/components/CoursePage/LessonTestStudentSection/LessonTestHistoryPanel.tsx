import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, ChevronRight, ClipboardList, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import CustomButton from '@/components/common/Button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { LessonTestQuestionCard } from './LessonTestQuestionCard'
import { LessonTestPassHintBanner } from './LessonTestPassHintBanner'
import lessonTestStudentService from '@/services/assistant/lesson-test-student.service'
import type {
  LessonTestSubmissionDetailItem,
  LessonTestSubmissionDetailResult,
  LessonTestSubmissionHistoryEntry,
  StudentQuizItem,
} from '@/types/lesson-test-student.type'
import { cn } from '@/lib/utils'
import { getLessonTestErrorMessage } from './utils'

function formatSubmittedAt(iso: string): string {
  try {
    const d = new Date(iso)
    return new Intl.DateTimeFormat('vi-VN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(d)
  } catch {
    return iso
  }
}

function LessonTestHistoryListSkeleton() {
  return (
    <div className='space-y-4' aria-busy aria-label='Đang tải lịch sử làm bài'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <Skeleton className='h-3 w-40 rounded' />
        <Skeleton className='h-8 w-20 rounded-lg' />
      </div>
      <ul className='space-y-2'>
        {[0, 1, 2, 3].map((k) => (
          <li key={k}>
            <div className='flex items-center gap-3 rounded-xl bg-white px-4 py-3 shadow-sm shadow-gray-900/[0.04]'>
              <Skeleton className='h-9 w-9 shrink-0 rounded-lg' />
              <div className='min-w-0 flex-1 space-y-2 py-0.5'>
                <Skeleton className='h-3.5 w-[min(100%,220px)] rounded-md' />
                <Skeleton className='h-3 w-[min(100%,160px)] rounded-md' />
              </div>
              <Skeleton className='h-4 w-4 shrink-0 rounded-sm' />
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

function LessonTestSubmissionDetailSkeleton() {
  return (
    <div className='space-y-5' aria-busy aria-label='Đang tải chi tiết bài nộp'>
      {[0, 1, 2].map((k) => (
        <div key={k} className='rounded-xl overflow-hidden bg-white space-y-3 shadow-sm shadow-gray-900/[0.04]'>
          <div className='flex gap-3 px-3 py-3 border-b border-gray-100 bg-gray-50/80'>
            <Skeleton className='h-7 w-10 rounded-lg shrink-0' />
            <div className='flex-1 space-y-2 pt-0.5'>
              <Skeleton className='h-3.5 w-full rounded-md' />
              <Skeleton className='h-3.5 w-4/5 rounded-md' />
            </div>
            <Skeleton className='h-6 w-6 rounded-full shrink-0' />
          </div>
          <div className='px-3 pb-3 pt-1 space-y-2'>
            <Skeleton className='h-3 w-40 rounded-md' />
            <Skeleton className='h-11 w-full rounded-xl' />
            <Skeleton className='h-11 w-full rounded-xl' />
            <Skeleton className='h-11 w-full rounded-xl' />
            <Skeleton className='h-16 w-full rounded-lg mt-2' />
          </div>
        </div>
      ))}
    </div>
  )
}

function detailItemToStudentQuiz(item: LessonTestSubmissionDetailItem): StudentQuizItem {
  return {
    id: item.quizId,
    question: item.question,
    type: item.type,
    difficulty: item.difficulty,
    bloomLevel: item.bloomLevel,
    choices: item.choices,
    isApproved: true,
    status: 'ACTIVE',
    createdAt: '',
    updatedAt: '',
  }
}

export interface LessonTestHistoryPanelProps {
  lessonId: string
  lessonType?: 'video' | 'article'
}

export const LessonTestHistoryPanel: React.FC<LessonTestHistoryPanelProps> = ({ lessonId, lessonType = 'video' }) => {
  const [rows, setRows] = useState<LessonTestSubmissionHistoryEntry[] | null>(null)
  const [listError, setListError] = useState<string | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detail, setDetail] = useState<LessonTestSubmissionDetailResult | null>(null)

  const loadList = useCallback(async () => {
    setListError(null)
    setRows(null)
    try {
      const res = await lessonTestStudentService.listSubmissions(lessonId)
      if (res.code === 200 && res.result) {
        setRows(res.result)
      } else {
        setListError(res.message || 'Không tải được lịch sử.')
        setRows([])
      }
    } catch (e) {
      setListError(getLessonTestErrorMessage(e))
      setRows([])
    }
  }, [lessonId])

  useEffect(() => {
    void loadList()
  }, [loadList])

  const openDetail = async (submissionId: string) => {
    setDetailOpen(true)
    setDetail(null)
    setDetailLoading(true)
    try {
      const res = await lessonTestStudentService.getSubmissionDetail(lessonId, submissionId)
      if (res.code === 200 && res.result) {
        setDetail(res.result)
      } else {
        toast.error(res.message || 'Không tải được chi tiết bài nộp.')
      }
    } catch (e) {
      toast.error(getLessonTestErrorMessage(e))
    } finally {
      setDetailLoading(false)
    }
  }

  const detailAnswers = useMemo(() => {
    if (!detail?.items?.length) return {}
    const acc: Record<string, string[]> = {}
    for (const it of detail.items) {
      acc[it.quizId] = it.selectedChoiceIds ?? []
    }
    return acc
  }, [detail])

  const detailCorrectCount = useMemo(() => {
    if (!detail?.items?.length) return 0
    return detail.items.filter((i) => i.isCorrect).length
  }, [detail])

  const showAnswerKey = detail?.answersRevealed ?? true

  if (rows === null && !listError) {
    return <LessonTestHistoryListSkeleton />
  }

  return (
    <div className='space-y-5'>
      <div className='flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2'>
          <div className='w-1 h-4 bg-blue-600 rounded-full' />
          <h3 className='text-[11px] font-bold tracking-widest text-gray-400'>
            Lịch sử nộp bài
          </h3>
        </div>
        <CustomButton
          type='button'
          variant='ghost'
          icon={<RefreshCw className='w-3 h-3' />}
          className='h-8 text-[10px] font-bold tracking-tight rounded-lg bg-blue-50/50 text-blue-600 hover:bg-blue-600 hover:text-white border border-blue-100/50 transition-all px-3'
          onClick={() => void loadList()}
        />
      </div>

      {listError ? (
        <div className='rounded-xl border border-red-100 bg-red-50/50 px-4 py-3 text-[12.5px] text-red-800 animate-in fade-in slide-in-from-top-2'>
          {listError}
        </div>
      ) : null}

      {!rows?.length ? (
        <div className='rounded-[2rem] border-2 border-dashed border-gray-100 bg-white/50 px-6 py-16 text-center space-y-4'>
          <div className='w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto'>
            <ClipboardList className='w-8 h-8 text-gray-300' />
          </div>
          <p className='text-[12.5px] font-medium text-gray-500 max-w-sm mx-auto leading-relaxed'>
            Chưa có lần nộp bài nào. Hoàn thành và nộp bài kiểm tra để thấy lịch sử tại đây.
          </p>
        </div>
      ) : (
        <ul className='grid gap-3'>
          {rows.map((r) => (
            <li key={r.submissionId}>
              <button
                type='button'
                onClick={() => void openDetail(r.submissionId)}
                className={cn(
                  'group w-full text-left rounded-2xl border border-gray-100 bg-white p-3.5 shadow-sm transition-all duration-300',
                  'hover:border-blue-300 hover:shadow-lg hover:shadow-blue-900/[0.04] hover:-translate-y-0.5',
                  'flex items-center gap-4'
                )}
              >
                <div className='shrink-0 w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 transition-all duration-300 group-hover:bg-blue-600 group-hover:text-white group-hover:scale-110'>
                  <CalendarClock className='w-5 h-5' />
                </div>
                <div className='min-w-0 flex-1 space-y-1.5'>
                  <p className='text-[13px] font-bold text-slate-800 leading-none'>
                    {formatSubmittedAt(r.submittedAt)}
                  </p>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-[11px] font-medium text-gray-500 tabular-nums bg-gray-50 px-1.5 py-0.5 rounded'>
                      {r.summary.earnedPoints}/{r.summary.maxPoints} điểm
                    </span>
                    <span
                      className={cn(
                        'text-[10px] font-black px-2 py-0.5 rounded-full transition-colors',
                        r.answersRevealed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      )}
                    >
                      {r.answersRevealed ? 'Đạt' : 'Chưa đạt'}
                    </span>
                    <span className={cn(
                      'text-[10px] font-black px-2 py-0.5 rounded-full transition-colors tabular-nums',
                      r.summary.percent >= 80 ? 'bg-emerald-50 text-emerald-600' :
                      r.summary.percent >= 50 ? 'bg-amber-50 text-amber-600' :
                      'bg-rose-50 text-rose-600'
                    )}>
                      {r.summary.percent}%
                    </span>
                  </div>
                </div>
                <div className='w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center transition-all group-hover:bg-blue-50 group-hover:text-blue-600'>
                  <ChevronRight className='w-4 h-4 text-gray-300 group-hover:text-blue-600' aria-hidden />
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Sheet
        open={detailOpen}
        onOpenChange={(open) => {
          setDetailOpen(open)
          if (!open) {
            setDetail(null)
            setDetailLoading(false)
          }
        }}
      >
        <SheetContent
          side='right'
          className='w-full sm:max-w-xl md:max-w-[32rem] flex flex-col overflow-hidden gap-0 p-0 border-0 shadow-2xl'
        >
          <SheetHeader className='px-4 pt-5 pb-3 border-b border-gray-100 shrink-0 space-y-2'>
            <SheetTitle className='text-left text-[15px] font-bold text-gray-900 tracking-tight'>
              Chi tiết bài nộp
            </SheetTitle>
            {detailLoading ? (
              <Skeleton className='h-3.5 w-[min(100%,280px)] rounded-md' />
            ) : detail ? (
              <p className='text-[11px] text-gray-500 font-medium'>
                {formatSubmittedAt(detail.submittedAt)} · {detail.summary.earnedPoints}/
                {detail.summary.maxPoints} điểm ({detail.summary.percent}%)
              </p>
            ) : null}
          </SheetHeader>

          <div className='flex-1 overflow-y-auto px-4 py-4 space-y-5'>
            {detailLoading ? <LessonTestSubmissionDetailSkeleton /> : null}

            {!detailLoading && detail ? (
              <>
                {!detail.answersRevealed ? <LessonTestPassHintBanner /> : null}

                <div className='rounded-xl border border-gray-100 bg-gradient-to-br from-slate-50 to-blue-50/40 px-4 py-3.5 shadow-sm shadow-gray-900/[0.03]'>
                  <p className='text-[10px] font-bold tracking-wider text-gray-500'>Thống kê lần nộp</p>
                  <div className='mt-2.5 flex flex-wrap items-end gap-x-6 gap-y-3'>
                    <div className='min-w-0'>
                      <p className='text-[22px] font-black tabular-nums text-[#0C356A] leading-none tracking-tight'>
                        {detail.summary.percent}%
                      </p>
                      <p className='text-[10.5px] font-semibold text-gray-500 mt-1.5'>Tỷ lệ</p>
                    </div>
                    <div className='hidden sm:block w-px h-10 bg-gray-200/90 shrink-0' aria-hidden />
                    <div className='min-w-0'>
                      <p className='text-base font-bold tabular-nums text-gray-900 leading-none'>
                        {detail.summary.earnedPoints}
                        <span className='text-gray-400 font-semibold text-sm'>/{detail.summary.maxPoints}</span>
                      </p>
                      <p className='text-[10.5px] font-semibold text-gray-500 mt-1.5'>Điểm</p>
                    </div>
                    <div className='min-w-0 sm:pl-1'>
                      <p className='text-base font-bold tabular-nums text-gray-900 leading-none'>
                        {detailCorrectCount}
                        <span className='text-gray-400 font-semibold text-sm'>/{detail.items.length}</span>
                      </p>
                      <p className='text-[10.5px] font-semibold text-gray-500 mt-1.5'>Câu đúng</p>
                    </div>
                  </div>
                </div>

                {detail.items.map((item, idx) => {
                  const quiz = detailItemToStudentQuiz(item)
                  return (
                    <LessonTestQuestionCard
                      key={item.quizId}
                      quiz={quiz}
                      gIdx={0}
                      qIdx={idx}
                      answers={detailAnswers}
                      setChoice={() => {}}
                      locked
                      row={item}
                      showAnswerKey={showAnswerKey}
                      flaggedIds={{}}
                      toggleFlag={() => {}}
                      chunks={detail.chunks}
                      lessonId={lessonId}
                      lessonType={lessonType}
                      subtitlesRaw={detail.subtitles}
                    />
                  )
                })}
              </>
            ) : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
