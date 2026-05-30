import React from 'react'
import { cn } from '@/lib/utils'
import type { LessonTestSubmissionItem } from '@/types/lesson-test-student.type'
import { scrollToLessonTestQuiz } from './utils'

const NAV_LEGEND = (
  <div className='mt-3 space-y-1.5 text-[9px] text-gray-500'>
    <p className='font-semibold text-gray-600 text-[10px] uppercase tracking-wide'>Chú thích</p>
    <div className='flex items-center gap-2'>
      <span className='h-2.5 w-2.5 rounded-sm border-2 border-dashed border-gray-300 bg-white shrink-0' />
      Chưa làm
    </div>
    <div className='flex items-center gap-2'>
      <span className='h-2.5 w-2.5 rounded-sm border-2 border-blue-500 bg-blue-50 shrink-0' />
      Đã chọn đáp án
    </div>
    <div className='flex items-center gap-2'>
      <span className='h-2.5 w-2.5 rounded-sm border-2 border-red-500 bg-red-50 shrink-0' />
      Gắn cờ
    </div>
  </div>
)

const POST_SUBMIT_LEGEND = (
  <div className='mt-2 space-y-1.5 text-[9px] text-gray-500 pt-2 border-t border-gray-100'>
    <p className='font-semibold text-gray-600 text-[10px] uppercase tracking-wide'>Sau khi nộp</p>
    <div className='flex items-center gap-2'>
      <span className='h-2.5 w-2.5 rounded-sm border-2 border-emerald-500 bg-emerald-50 shrink-0' />
      Đúng
    </div>
    <div className='flex items-center gap-2'>
      <span className='h-2.5 w-2.5 rounded-sm border-2 border-amber-500 bg-amber-50 shrink-0' />
      Sai
    </div>
  </div>
)

function NavCell({
  quizId,
  globalN,
  compact,
  flagged,
  answered,
  row,
  lockedAll,
}: {
  quizId: string
  globalN: number
  compact: boolean
  flagged: boolean
  answered: boolean
  row: LessonTestSubmissionItem | undefined
  lockedAll: boolean
}) {
  return (
    <button
      type='button'
      onClick={() => scrollToLessonTestQuiz(quizId)}
      title={`Câu ${globalN}`}
      className={cn(
        'rounded-md border-2 font-bold tabular-nums transition-colors',
        compact
          ? 'h-8 w-8 shrink-0 flex items-center justify-center text-[10px]'
          : 'min-h-[2.25rem] flex items-center justify-center text-[11px]',
        flagged && 'border-red-500 bg-red-50 text-red-700 shadow-sm',
        !flagged && lockedAll && row?.isCorrect && 'border-emerald-500 bg-emerald-50 text-emerald-800',
        !flagged && lockedAll && row && !row.isCorrect && 'border-amber-500 bg-amber-50 text-amber-900',
        !flagged && !lockedAll && answered && 'border-blue-500 bg-blue-50 text-blue-800',
        !flagged && !lockedAll && !answered && 'border-dashed border-gray-200 bg-white text-gray-400',
        !flagged && lockedAll && !row && 'border-dashed border-gray-200 bg-white text-gray-400'
      )}
    >
      {globalN}
    </button>
  )
}

export type QuestionMapState = {
  questionNavItems: { quizId: string; globalN: number }[]
  flaggedIds: Record<string, boolean>
  answers: Record<string, string[]>
  resultByQuizId: Map<string, LessonTestSubmissionItem>
  lockedAll: boolean
}

function mapCells(items: QuestionMapState['questionNavItems'], state: QuestionMapState, compact: boolean) {
  return items.map(({ quizId, globalN }) => (
    <NavCell
      key={quizId}
      quizId={quizId}
      globalN={globalN}
      compact={compact}
      flagged={Boolean(state.flaggedIds[quizId])}
      answered={Boolean(state.answers[quizId]?.[0])}
      row={state.resultByQuizId.get(quizId)}
      lockedAll={state.lockedAll}
    />
  ))
}

/** Nằm trong cột trái (chỉ mobile). */
export const LessonTestQuestionNavMobile: React.FC<QuestionMapState> = (state) => {
  const { questionNavItems } = state
  if (questionNavItems.length === 0) return null
  return (
    <div className='lg:hidden sticky top-4 z-30 -mx-4 px-4 py-2 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm'>
      <p className='text-[9px] font-bold uppercase tracking-wider text-[#0C356A] mb-1.5'>
        Bản đồ câu — bấm để nhảy tới
      </p>
      <div className='flex gap-1 overflow-x-auto pb-1 scrollbar-none'>{mapCells(questionNavItems, state, true)}</div>
    </div>
  )
}

/** Nằm trong cột phụ desktop. */
export const LessonTestQuestionNavDesktop: React.FC<QuestionMapState> = (state) => {
  const { questionNavItems, lockedAll } = state
  if (questionNavItems.length === 0) return null
  return (
    <div className='hidden lg:block lg:sticky lg:top-4 lg:z-20 lg:h-fit'>
      <div className='rounded-xl border border-gray-100 bg-gray-50/40 shadow-sm p-3 space-y-2 max-h-[min(68vh,calc(100dvh-6rem))] overflow-y-auto overscroll-contain'>
        <p className='text-[10px] font-bold uppercase tracking-wider text-[#0C356A]'>Bản đồ câu</p>
        <p className='text-[9px] text-gray-500 leading-snug'>Bấm ô để cuộn tới câu.</p>
        <div className='grid grid-cols-6 gap-1.5'>{mapCells(questionNavItems, state, false)}</div>
        {NAV_LEGEND}
        {lockedAll ? POST_SUBMIT_LEGEND : null}
      </div>
    </div>
  )
}
