import { CheckCircle2 } from 'lucide-react'
import type { Quiz } from '@/types/ai'
import { cn } from '@/lib/utils'

interface ReadOnlyQuizListProps {
  quizzes: Quiz[]
}

export function ReadOnlyQuizList({ quizzes }: ReadOnlyQuizListProps) {
  if (quizzes.length === 0) {
    return <p className='text-sm text-slate-500'>Chưa có câu hỏi.</p>
  }

  return (
    <div className='space-y-3'>
      {quizzes.map((quiz, qIdx) => (
        <div
          key={quiz.id}
          className='rounded-xl border border-slate-100 bg-white p-4 shadow-sm ring-1 ring-slate-100/80'
        >
          <div className='mb-3 text-sm font-medium leading-snug text-slate-800 flex items-start gap-1'>
            <span>{qIdx + 1}.</span>
            <div dangerouslySetInnerHTML={{ 
              __html: (quiz.question || '').includes('&lt;') 
                ? new DOMParser().parseFromString(quiz.question || '', 'text/html').documentElement.textContent || ''
                : (quiz.question || '')
            }} className='prose-sm max-w-none prose-p:my-0' />
          </div>
          <ul className='space-y-1.5'>
            {quiz.choices.map((choice) => (
              <li
                key={choice.id}
                className={cn(
                  'rounded-lg border px-3 py-2 text-sm',
                  choice.isCorrect
                    ? 'border-emerald-200/80 bg-emerald-50/90 text-emerald-900'
                    : 'border-slate-100 bg-slate-50/50 text-slate-700'
                )}
              >
                <span className='flex items-center gap-2'>
                  {choice.isCorrect && (
                    <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600' />
                  )}
                  {choice.text}
                </span>
              </li>
            ))}
          </ul>
          {quiz.explanation && (
            <div className='mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs leading-relaxed text-slate-600 prose-sm max-w-none prose-p:my-0 prose-p:inline'>
              <span className='font-medium text-slate-700 mr-1'>Giải thích:</span>
              <span dangerouslySetInnerHTML={{ __html: quiz.explanation }} />
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
