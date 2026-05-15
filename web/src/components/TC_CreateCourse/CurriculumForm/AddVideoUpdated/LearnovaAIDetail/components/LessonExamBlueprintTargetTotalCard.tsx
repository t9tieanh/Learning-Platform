import React from 'react'
import { AlertCircle, Hash, Info } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

/** Target total, sum check line, and optional "sync from groups" action for the exam blueprint form. */
export interface LessonExamBlueprintTargetTotalCardProps {
  chunkCount: number
  targetTotal: number
  totalGenerated: number
  isGenerating: boolean
  sumRowQuestionCounts: number
  countsMatchTarget: boolean
}

const LessonExamBlueprintTargetTotalCard: React.FC<
  LessonExamBlueprintTargetTotalCardProps
> = ({
  chunkCount,
  targetTotal,
  totalGenerated,
  isGenerating,
  sumRowQuestionCounts,
  countsMatchTarget,
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
              Tổng số câu hỏi mục tiêu cho toàn bài thi (tổng hợp từ các nhóm bên dưới).
              Con số này sẽ được dùng để đối soát tiến độ khi AI bắt đầu sinh nội dung.
            </p>
          </div>
          <div className='w-full max-w-[8.5rem] sm:ml-auto sm:shrink-0'>
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      'h-10 px-3 flex items-center justify-center text-[15px] md:text-[16px] font-bold rounded-xl border tabular-nums w-full shadow-inner gap-1.5 transition-colors cursor-help',
                      totalGenerated > targetTotal
                        ? 'text-amber-600 bg-amber-50/50 border-amber-100'
                        : totalGenerated === targetTotal
                          ? 'text-green-600 bg-green-50/40 border-green-100'
                          : 'text-blue-600 bg-blue-50/50 border-blue-100'
                    )}
                  >
                    {totalGenerated > targetTotal && (
                      <AlertCircle className='w-3.5 h-3.5' strokeWidth={2.5} />
                    )}
                    <span>{totalGenerated}</span>
                    <span className='text-gray-400 font-medium'>/</span>
                    <span>{targetTotal}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className='max-w-[240px] text-[12px] p-3' side='left'>
                  {totalGenerated > targetTotal ? (
                    <p>
                      Số câu đã sinh (<strong>{totalGenerated}</strong>) vượt quá mục tiêu bài thi (
                      <strong>{targetTotal}</strong>). Điều này xảy ra nếu bạn sinh lại nội dung hoặc
                      thêm câu hỏi thủ công.
                    </p>
                  ) : (
                    <p>
                      Tiến độ sinh câu hỏi: <strong>{totalGenerated}</strong> câu đã sẵn sàng trên tổng
                      mục tiêu <strong>{targetTotal}</strong> câu.
                    </p>
                  )}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    )
  }

export default LessonExamBlueprintTargetTotalCard
