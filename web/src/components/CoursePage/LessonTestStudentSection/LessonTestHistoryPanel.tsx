import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, ChevronRight, ClipboardList, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import CustomButton from '@/components/common/Button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { LessonTestQuestionCard } from './LessonTestQuestionCard'
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
}

export const LessonTestHistoryPanel: React.FC<LessonTestHistoryPanelProps> = ({ lessonId }) => {
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

  if (rows === null && !listError) {
    return <LessonTestHistoryListSkeleton />
  }

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <p className='text-[11px] font-bold tracking-wider text-gray-400'>
          Các lần nộp gần đây
        </p>
        <CustomButton
          type='button'
          variant='outline'
          label='Làm mới'
          icon={<RefreshCw className='w-3 h-3' />}
          className='h-8 text-[10px] font-bold tracking-[0.08em] rounded-lg border-gray-200'
          onClick={() => void loadList()}
        />
      </div>

      {listError ? (
        <div className='rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-[12.5px] text-gray-800'>
          {listError}
        </div>
      ) : null}

      {!rows?.length ? (
        <div className='rounded-[2rem] border border-gray-100 bg-white px-6 py-12 text-center shadow-sm space-y-3'>
          <ClipboardList className='w-9 h-9 mx-auto text-gray-300' />
          <p className='text-[12.5px] font-medium text-gray-500 max-w-sm mx-auto'>
            Chưa có lần nộp bài nào. Hoàn thành và nộp bài kiểm tra để thấy lịch sử tại đây.
          </p>
        </div>
      ) : (
        <ul className='space-y-2'>
          {rows.map((r) => (
            <li key={r.submissionId}>
              <button
                type='button'
                onClick={() => void openDetail(r.submissionId)}
                className={cn(
                  'w-full text-left rounded-xl border-0 bg-white px-4 py-3 shadow-sm shadow-gray-900/[0.04]',
                  'flex items-center gap-3 transition-colors hover:bg-gray-50/90'
                )}
              >
                <div className='shrink-0 w-9 h-9 rounded-lg bg-slate-50 border border-gray-100 flex items-center justify-center text-gray-500'>
                  <CalendarClock className='w-4 h-4' />
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='text-[12.5px] font-semibold text-gray-800'>
                    {formatSubmittedAt(r.submittedAt)}
                  </p>
                  <p className='text-[11px] text-gray-500 mt-0.5 tabular-nums'>
                    {r.summary.earnedPoints}/{r.summary.maxPoints} điểm ·{' '}
                    <span className='font-semibold text-gray-800'>{r.summary.percent}%</span>
                  </p>
                </div>
                <ChevronRight className='w-4 h-4 text-gray-300 shrink-0' aria-hidden />
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

            {!detailLoading && detail
              ? detail.items.map((item, idx) => {
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
                      flaggedIds={{}}
                      toggleFlag={() => {}}
                    />
                  )
                })
              : null}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
