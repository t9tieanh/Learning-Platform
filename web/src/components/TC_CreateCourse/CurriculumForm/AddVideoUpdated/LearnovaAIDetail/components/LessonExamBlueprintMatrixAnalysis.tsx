import React from 'react'
import { TableProperties, Info, Eye, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { LessonChunk } from '@/types/ai'
import CustomButton from '@/components/common/Button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export interface MatrixRowData {
  id: string
  label: string
  questionRange: string
  hasQuizzes: boolean
  chunks: LessonChunk[]
}

export interface LessonExamBlueprintMatrixAnalysisProps {
  rows: MatrixRowData[]
  onViewDetail?: (rowId: string) => void
  onRefresh?: () => void
  isRefreshing?: boolean
}

const LessonExamBlueprintMatrixAnalysis: React.FC<
  LessonExamBlueprintMatrixAnalysisProps
> = ({ rows, onViewDetail, onRefresh, isRefreshing }) => {
  return (
    <div className='mt-8 pt-6 border-t border-gray-100/80 animate-in fade-in slide-in-from-top-2 duration-500'>
      <div className='flex items-center justify-between mb-4'>
        <div className='flex items-center gap-2'>
          <div className='p-1.5 rounded-lg bg-indigo-50'>
            <TableProperties className='w-4 h-4 text-indigo-600' />
          </div>
          <div>
            <h3 className='text-[14px] font-bold text-slate-800 leading-none'>
              Ánh xạ chuẩn đầu ra ↔ Câu hỏi
            </h3>
            <p className='text-[11px] text-slate-500 mt-1 font-medium'>
              Phân tích ma trận năng lực dựa trên cấu hình các nhóm nội dung
            </p>
          </div>
        </div>

        {onRefresh && (
          <CustomButton
            type='button'
            variant='ghost'
            size='sm'
            label='Làm mới'
            isLoader={isRefreshing}
            icon={isRefreshing ? undefined : <RefreshCw className='w-3.5 h-3.5' />}
            onClick={onRefresh}
            className='h-8 text-[11px] font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all px-2.5'
          />
        )}
      </div>

      <div className='overflow-hidden rounded-xl border border-slate-100 shadow-sm'>
        <table className='w-full text-left text-[13px] border-collapse bg-white'>
          <thead className='bg-slate-50/80 border-b border-slate-100'>
            <tr>
              <th className='px-4 py-3 font-semibold text-slate-700 w-1/2 sm:w-[55%]'>Chuẩn đầu ra của học phần</th>
              <th className='px-4 py-3 font-semibold text-slate-700 text-center'>Câu hỏi</th>
              <th className='px-4 py-3 font-semibold text-slate-700 text-center'>Thao tác</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-slate-50'>
            {rows.map((row) => (
              <tr key={row.id} className='hover:bg-slate-50/40 transition-colors'>
                <td className='px-4 py-3.5 space-y-2'>
                  <div className='text-slate-800 font-bold leading-relaxed'>
                    {row.label}
                  </div>
                  <div className='flex flex-wrap gap-1.5'>
                    <TooltipProvider>
                      {row.chunks.map((chunk, cIdx) => (
                        <Tooltip key={chunk.id} delayDuration={200}>
                          <TooltipTrigger asChild>
                            <div className='inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-blue-50/60 border border-blue-100/80 text-[11px] font-medium text-blue-700 cursor-help hover:bg-blue-100/70 transition-colors'>
                              <span className='opacity-70'>#{cIdx + 1}</span>
                              <span className='max-w-[150px] truncate'>{chunk.title || 'Phân đoạn không tên'}</span>
                              <Info className='w-3 h-3 opacity-60' />
                            </div>
                          </TooltipTrigger>
                          <TooltipContent 
                            side='top' 
                            className='max-w-[320px] p-3.5 bg-white border border-slate-200 shadow-xl rounded-xl animate-in fade-in zoom-in-95 duration-200'
                          >
                            <p className='font-bold mb-1.5 text-blue-700 text-[13px]'>{chunk.title || `Phân đoạn ${cIdx + 1}`}</p>
                            <p className='text-slate-600 leading-relaxed text-[12px]'>{chunk.summary || 'Không có tóm tắt.'}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                </td>
                <td className='px-4 py-3.5 text-center align-top'>
                  <span className={cn(
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold tabular-nums',
                    row.hasQuizzes 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  )}>
                    {row.questionRange}
                  </span>
                </td>
                <td className='px-4 py-3.5 text-center align-top'>
                  <button
                    type='button'
                    onClick={() => onViewDetail?.(row.id)}
                    className='inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm'
                  >
                    <Eye className='w-3.5 h-3.5' />
                    Xem chi tiết
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LessonExamBlueprintMatrixAnalysis
