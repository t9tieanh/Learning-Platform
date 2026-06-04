import React from 'react'
import { Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

export const LESSON_TEST_PASS_HINT =
  'Hãy cố lên, nếu đạt 50% số điểm, bạn sẽ được đánh dấu pass bài kiểm tra và được xem giải thích từ Learnova'

export interface LessonTestPassHintBannerProps {
  className?: string
}

export const LessonTestPassHintBanner: React.FC<LessonTestPassHintBannerProps> = ({ className }) => (
  <div
    role='status'
    className={cn(
      'rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 shadow-sm shadow-amber-900/[0.04]',
      className
    )}
  >
    <div className='flex gap-3 items-start'>
      <Lightbulb className='w-4 h-4 text-amber-600 shrink-0 mt-0.5' aria-hidden />
      <p className='text-[12.5px] font-semibold text-amber-900 leading-relaxed'>{LESSON_TEST_PASS_HINT}</p>
    </div>
  </div>
)
