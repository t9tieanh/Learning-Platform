import { PlayCircle, ChevronDown, Layers, HelpCircle, AlignLeft } from 'lucide-react'
import type { LessonChunk } from '@/types/ai'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AdminReadOnlyQuizList } from './ReadOnlyQuizList'

interface SegmentListProps {
  chunks: LessonChunk[]
  onSeek?: (startTime: string | null) => void
}

export function SegmentList({ chunks, onSeek }: SegmentListProps) {
  if (chunks.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white py-16 text-center'>
        <Layers className='mb-3 h-10 w-10 text-slate-300' />
        <p className='text-sm text-slate-600'>Chưa có phân đoạn nào.</p>
        <p className='mt-1 text-xs text-slate-400'>AI chưa phân tích hoặc bài học chưa có video.</p>
      </div>
    )
  }

  const totalQuizzes = chunks.reduce((acc, c) => acc + (c.quizzes?.length || 0), 0)

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-4 rounded-xl border border-slate-100 bg-white px-4 py-3.5 text-sm text-slate-600 shadow-sm sm:px-5'>
        <span className='flex items-center gap-2'>
          <Layers className='h-4 w-4 text-slate-400' />
          {chunks.length} phân đoạn
        </span>
        <span className='hidden h-4 w-px bg-slate-200 sm:block' />
        <span className='flex items-center gap-2'>
          <HelpCircle className='h-4 w-4 text-slate-400' />
          {totalQuizzes} câu hỏi ôn tập
        </span>
      </div>

      <Accordion type='multiple' className='space-y-3'>
        {chunks.map((chunk, idx) => (
          <AccordionItem
            key={chunk.id}
            value={chunk.id}
            className='overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm ring-1 ring-slate-100/80'
          >
            <AccordionTrigger className='px-5 py-4 hover:no-underline sm:px-6 [&[data-state=open]>svg:last-child]:rotate-180'>
              <div className='flex flex-1 items-start gap-3 text-left'>
                <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-medium text-slate-600'>
                  {idx + 1}
                </span>
                <div className='min-w-0 flex-1 pr-2'>
                  <p className='text-sm font-medium leading-snug text-slate-800'>
                    {chunk.title || `Phân đoạn ${idx + 1}`}
                  </p>
                  <div className='mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500'>
                    {chunk.startTime && (
                      <button
                        type='button'
                        className='inline-flex items-center gap-1 text-blue-600 hover:underline'
                        onClick={(e) => {
                          e.stopPropagation()
                          onSeek?.(chunk.startTime)
                        }}
                      >
                        <PlayCircle className='h-3.5 w-3.5' />
                        {chunk.startTime}
                        {chunk.endTime ? ` – ${chunk.endTime}` : ''}
                      </button>
                    )}
                    {(chunk.quizzes?.length ?? 0) > 0 && (
                      <span className='inline-flex items-center gap-1'>
                        <HelpCircle className='h-3 w-3' />
                        {chunk.quizzes?.length} câu hỏi
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <ChevronDown className='h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200' />
            </AccordionTrigger>

            <AccordionContent className='border-t border-slate-100 px-5 pb-5 pt-4 sm:px-6'>
              {chunk.summary && (
                <div className='mb-5 rounded-lg bg-slate-50 px-4 py-3.5'>
                  <p className='mb-1.5 flex items-center gap-1.5 text-xs text-slate-500'>
                    <AlignLeft className='h-3.5 w-3.5' />
                    Tóm tắt
                  </p>
                  <p className='text-sm leading-relaxed text-slate-700'>{chunk.summary}</p>
                </div>
              )}

              <div>
                <p className='mb-3 flex items-center gap-1.5 text-xs text-slate-500'>
                  <HelpCircle className='h-3.5 w-3.5' />
                  Câu hỏi ôn tập
                </p>
                <AdminReadOnlyQuizList
                  quizzes={chunk.quizzes || []}
                  chunks={chunks}
                  onSeek={onSeek}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  )
}
