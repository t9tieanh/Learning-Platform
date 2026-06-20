import React from 'react'
import { CheckCircle2, Flag, XCircle } from 'lucide-react'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { LessonTestSubmissionItem, StudentQuizItem } from '@/types/lesson-test-student.type'
import { LessonChunk } from '@/types/ai'
import StudentExplanationRemediation from './StudentExplanationRemediation'

export interface LessonTestQuestionCardProps {
  quiz: StudentQuizItem
  gIdx: number
  qIdx: number
  answers: Record<string, string[]>
  setChoice: (quizId: string, choiceId: string) => void
  locked: boolean
  row: LessonTestSubmissionItem | undefined
  showAnswerKey?: boolean
  flaggedIds: Record<string, boolean>
  toggleFlag: (quizId: string) => void
  chunks?: LessonChunk[]
  lessonId?: string
  lessonType?: 'video' | 'article'
  subtitlesRaw?: string | null
  onSeek?: (timestamp: string) => void
}

export const LessonTestQuestionCard: React.FC<LessonTestQuestionCardProps> = ({
  quiz,
  gIdx,
  qIdx,
  answers,
  setChoice,
  locked,
  row,
  showAnswerKey = true,
  flaggedIds,
  toggleFlag,
  chunks = [],
  lessonId,
  lessonType = 'video',
  subtitlesRaw,
  onSeek,
}) => (
  <div
    id={`lesson-test-quiz-${quiz.id}`}
    className={cn(
      'scroll-mt-28 rounded-xl border overflow-hidden shadow-sm shadow-gray-900/[0.04] transition-colors',
      row &&
        (row.isCorrect
          ? 'border-emerald-200/90 ring-1 ring-emerald-500/10'
          : 'border-gray-200/90'),
      !row && 'border-gray-200/90'
    )}
  >
    <div className='px-2.5 md:px-4 py-2 md:py-3 flex gap-2.5 md:gap-3 items-start bg-gradient-to-r from-slate-50 via-blue-50/25 to-white border-b border-gray-100'>
      <span
        className='mt-0.5 shrink-0 inline-flex h-7 min-w-[2.5rem] items-center justify-center rounded-lg bg-white border border-blue-100 text-[11px] font-bold text-[#0C356A] tabular-nums shadow-sm'
        aria-hidden
      >
        {gIdx + 1}.{qIdx + 1}
      </span>
      <div className='text-[12.5px] font-semibold text-gray-800 leading-snug min-w-0 flex-1 prose-sm max-w-none prose-p:my-0' dangerouslySetInnerHTML={{ 
        __html: (quiz.question || '').includes('&lt;') 
          ? new DOMParser().parseFromString(quiz.question || '', 'text/html').documentElement.textContent || ''
          : (quiz.question || '')
      }} />
      <div className='flex items-start gap-1 shrink-0'>
        {!locked ? (
          <button
            type='button'
            onClick={() => toggleFlag(quiz.id)}
            aria-pressed={Boolean(flaggedIds[quiz.id])}
            aria-label={flaggedIds[quiz.id] ? 'Bỏ cờ' : 'Gắn cờ xem lại'}
            className={cn(
              'p-1.5 rounded-lg border transition-colors',
              flaggedIds[quiz.id]
                ? 'border-red-200 bg-red-50 text-red-600'
                : 'border-transparent text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            )}
          >
            <Flag className={cn('w-4 h-4', flaggedIds[quiz.id] && 'fill-red-500')} strokeWidth={2} />
          </button>
        ) : null}
        {row ? (
          row.isCorrect ? (
            <CheckCircle2 className='w-4 h-4 text-emerald-600 shrink-0 mt-0.5' aria-label='Đúng' />
          ) : (
            <XCircle className='w-4 h-4 text-red-500 shrink-0 mt-0.5' aria-label='Sai' />
          )
        ) : null}
      </div>
    </div>

    <div className='bg-white px-2.5 md:px-4 py-2.5 md:py-3 space-y-2.5 md:space-y-3'>
      <p className='text-[10px] font-bold uppercase tracking-wider text-gray-400'>
        Câu hỏi · {quiz.type?.replace(/_/g, ' ')} · {quiz.difficulty}
      </p>

      <RadioGroup
        value={answers[quiz.id]?.[0] ?? ''}
        onValueChange={(v) => !locked && setChoice(quiz.id, v)}
        disabled={locked}
        className='flex flex-col gap-2.5'
      >
        {quiz.choices.map((c, optIdx) => {
          const choiceId = `${quiz.id}-${c.id}`
          const letter = String.fromCharCode(65 + optIdx)
          const picked = (answers[quiz.id]?.[0] ?? '') === c.id
          const isCorrectChoice = showAnswerKey && Boolean(row?.correctChoiceIds?.includes(c.id))
          const isWrongPick =
            locked && row && !row.isCorrect && picked && (showAnswerKey ? !isCorrectChoice : true)

          return (
            <div
              key={c.id}
              className={cn(
                'relative rounded-xl border-2 bg-white transition-all duration-200',
                'shadow-sm shadow-gray-900/[0.03]',
                !locked && 'hover:border-blue-300/90 hover:shadow-md hover:shadow-blue-900/[0.06]',
                !locked && picked && 'border-blue-500 bg-gradient-to-r from-blue-50/90 to-white ring-1 ring-blue-500/20 shadow-md',
                !locked && !picked && 'border-gray-100',
                locked && isCorrectChoice && 'border-emerald-200/60 bg-emerald-50/30 shadow-[0_0_20px_-5px_rgba(16,185,129,0.1)] ring-1 ring-emerald-500/5',
                locked && isWrongPick && 'border-rose-200/60 bg-rose-50/30 shadow-[0_0_20px_-5px_rgba(244,63,94,0.1)] ring-1 ring-rose-500/5',
                locked && !isCorrectChoice && !isWrongPick && 'border-gray-100 bg-gray-50/10 opacity-70'
              )}
            >
              <Label
                htmlFor={choiceId}
                className='flex items-center gap-2 md:gap-3 px-2.5 py-2 md:px-3.5 md:py-3 cursor-pointer select-none'
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-bold tabular-nums transition-colors',
                    !locked &&
                      (picked ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25' : 'bg-gray-100 text-gray-600'),
                    locked && isCorrectChoice && 'bg-emerald-500 text-white border-none shadow-[0_4px_12px_-2px_rgba(16,185,129,0.3)]',
                    locked && isWrongPick && 'bg-rose-500 text-white border-none shadow-[0_4px_12px_-2px_rgba(244,63,94,0.3)]',
                    locked && !isCorrectChoice && !isWrongPick && 'bg-gray-100 text-gray-400 border border-gray-200/50'
                  )}
                  aria-hidden
                >
                  {letter}
                </span>
                <span className='text-[12.5px] font-semibold leading-snug text-gray-800 flex-1 min-w-0'>{c.text}</span>
                <RadioGroupItem 
                  value={c.id} 
                  id={choiceId} 
                  disabled={locked} 
                  className={cn(
                    'shrink-0 transition-all duration-300',
                    locked && isCorrectChoice && 'border-emerald-500 text-emerald-500 fill-emerald-500 scale-110',
                    locked && isWrongPick && 'border-rose-500 text-rose-500 fill-rose-500 scale-110'
                  )} 
                />
              </Label>
            </div>
          )
        })}
      </RadioGroup>

      {locked && showAnswerKey && row?.explanation ? (
        <div className='relative rounded-2xl border border-blue-100/50 bg-white/40 backdrop-blur-md px-3 md:px-4 py-3 md:py-3.5 mt-2 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden group/expl'>
          <div className='absolute top-0 left-0 w-1 h-full bg-blue-500/50' />
          <span className='font-bold text-[#0C356A] text-[11px] tracking-widest mb-2 block opacity-70'>Phân tích đáp án</span>
          {lessonId ? (
            <StudentExplanationRemediation
              explanation={row.explanation}
              chunks={chunks}
              lessonId={lessonId}
              lessonType={lessonType}
              subtitlesRaw={subtitlesRaw}
              onSeek={onSeek}
            />
          ) : (
            <div className='text-[12.5px] font-medium text-gray-700 leading-relaxed prose-sm max-w-none prose-p:my-0' dangerouslySetInnerHTML={{ __html: row.explanation }} />
          )}
        </div>
      ) : null}
    </div>
  </div>
)
