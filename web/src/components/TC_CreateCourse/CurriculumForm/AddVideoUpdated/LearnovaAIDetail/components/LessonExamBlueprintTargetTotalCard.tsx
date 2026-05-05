import React from 'react'
import { Hash } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

/** Target total, sum check line, and optional "sync from groups" action for the exam blueprint form. */
export interface LessonExamBlueprintTargetTotalCardProps {
  chunkCount: number
  targetTotal: number
  onTargetTotalChange: (n: number) => void
  minTotal: number
  maxTotal: number
  sumRowQuestionCounts: number
  countsMatchTarget: boolean
  isGenerating: boolean
  onSyncTargetToGroupSums: () => void
}

const LessonExamBlueprintTargetTotalCard: React.FC<
  LessonExamBlueprintTargetTotalCardProps
> = ({
  chunkCount,
  targetTotal,
  onTargetTotalChange,
  minTotal,
  maxTotal,
  sumRowQuestionCounts,
  countsMatchTarget,
  isGenerating,
  onSyncTargetToGroupSums,
}) => {
  return (
    <div className='rounded-xl border border-blue-100/90 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/15 p-4 md:p-5 space-y-3 shadow-sm ring-1 ring-blue-100/30'>
      <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'>
        <div className='space-y-1.5 min-w-0 flex-1'>
          <Label
            htmlFor='lesson-exam-total-questions'
            className='text-[12px] md:text-[13px] font-semibold text-gray-800 flex items-center gap-1.5'
          >
            <Hash className='w-4 h-4 text-blue-600 shrink-0' strokeWidth={2.5} />
            Tổng câu cần tạo (toàn bài)
          </Label>
          <p className='text-[11px] md:text-[12px] text-gray-500 font-medium leading-snug'>
            Mặc định bằng số phân đoạn hiện có ({chunkCount}): từ {minTotal} đến {maxTotal} câu (mỗi nhóm
            1–50, tổng các nhóm phải bằng số ở đây). Đổi số ở đây sẽ chia lại tự động xuống từng nhóm
            theo tỷ lệ ổn định.
          </p>
        </div>
        <div className='w-full max-w-[7.5rem] sm:ml-auto sm:shrink-0'>
          <Input
            id='lesson-exam-total-questions'
            type='number'
            min={minTotal}
            max={maxTotal}
            value={targetTotal}
            onChange={(e) => {
              const n = parseInt(e.target.value, 10)
              if (Number.isNaN(n)) {
                return
              }
              onTargetTotalChange(n)
            }}
            disabled={isGenerating}
            className='h-10 text-center text-[14px] md:text-[15px] font-bold border-gray-200 bg-white tabular-nums w-full'
            aria-invalid={!countsMatchTarget}
          />
        </div>
      </div>
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center sm:flex-wrap gap-2 sm:gap-x-3 sm:gap-y-1.5 text-[12px] md:text-[13px] font-medium',
          countsMatchTarget ? 'text-slate-500' : 'text-amber-800'
        )}
        role='status'
      >
        <div className='flex flex-wrap items-center gap-x-3 gap-y-1 min-w-0 flex-1'>
          <span className='tabular-nums'>
            Tổng các nhóm: <strong className='text-slate-800'>{sumRowQuestionCounts}</strong> /{' '}
            {targetTotal}
          </span>
          {!countsMatchTarget ? (
            <span className='text-amber-800/95'>Tổng các nhóm lệch với tổng câu cần tạo ở trên.</span>
          ) : null}
        </div>
        {!countsMatchTarget ? (
          <CustomButton
            type='button'
            variant='outline'
            label='Đồng bộ tổng theo nhóm'
            onClick={onSyncTargetToGroupSums}
            disabled={isGenerating}
            className='h-9 text-[12px] font-semibold border-amber-200 text-amber-900 bg-amber-50/80 hover:bg-amber-100/90 rounded-lg shrink-0 w-full sm:w-auto'
          />
        ) : null}
      </div>
    </div>
  )
}

export default LessonExamBlueprintTargetTotalCard
