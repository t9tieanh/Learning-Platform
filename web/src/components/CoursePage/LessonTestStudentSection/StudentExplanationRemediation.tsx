import React, { useMemo, useState } from 'react'
import { Play, FileText, Sparkles } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible'
import RemediationVideoPlayer from './RemediationVideoPlayer'
import RemediationArticleViewer from './RemediationArticleViewer'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import chunkCitationUtil from '@/utils/chunkCitation.util'

interface StudentExplanationRemediationProps {
  explanation: string
  chunks: LessonChunk[]
  lessonId: string
  lessonType?: 'video' | 'article'
  subtitlesRaw?: string | null
  onSeek?: (timestamp: string) => void
}

const StudentExplanationRemediation: React.FC<StudentExplanationRemediationProps> = ({
  explanation,
  chunks,
  lessonId,
  lessonType = 'video',
  subtitlesRaw,
  onSeek,
}) => {
  const [openChunkId, setOpenChunkId] = useState<string | null>(null)
  const isArticleLesson = lessonType === 'article'

  const parts = useMemo(() => {
    const normalized = chunkCitationUtil.normalizeChunkCitationText(explanation)
    const regex = /@{{([0-9a-fA-F-]+)}}@/g
    const result: (string | { chunkId: string })[] = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(normalized)) !== null) {
      if (match.index > lastIndex) {
        result.push(normalized.substring(lastIndex, match.index))
      }
      result.push({ chunkId: match[1] })
      lastIndex = regex.lastIndex
    }

    if (lastIndex < normalized.length) {
      result.push(normalized.substring(lastIndex))
    }

    return result
  }, [explanation])

  const toggleChunk = (chunk: LessonChunk) => {
    setOpenChunkId(openChunkId === chunk.id ? null : chunk.id)
  }

  if (parts.length === 0) {
    return <div className='text-gray-700 prose-sm max-w-none prose-p:my-0' dangerouslySetInnerHTML={{ 
      __html: explanation.includes('&lt;') ? new DOMParser().parseFromString(explanation, 'text/html').documentElement.textContent || '' : explanation 
    }} />
  }

  return (
    <div className='space-y-3'>
      <p className='text-[12.5px] font-medium text-gray-700 leading-relaxed'>
        {parts.map((part, i) => {
          if (typeof part === 'string') return <span key={i} dangerouslySetInnerHTML={{ 
            __html: part.includes('&lt;') ? new DOMParser().parseFromString(part, 'text/html').documentElement.textContent || '' : part 
          }} />

          const chunk = chunks.find((c) => c.id === part.chunkId)
          if (!chunk) return <span key={i} className='text-slate-400 opacity-60'>[Nội dung cũ]</span>

          const isOpen = openChunkId === chunk.id

          return (
            <TooltipProvider key={i} delayDuration={300}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className='inline-flex items-center gap-1 md:gap-1.5 mx-0.5 md:mx-1 p-0.5 pr-1.5 md:pr-2 rounded-full border border-blue-200 bg-blue-50/50 hover:bg-blue-100 transition-all group cursor-default shadow-sm'>
                    <button
                      type='button'
                      onClick={() => toggleChunk(chunk)}
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full transition-all',
                        isOpen 
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
                          : 'bg-white text-blue-600 hover:bg-blue-600 hover:text-white'
                      )}
                      title={isOpen ? (isArticleLesson ? 'Đóng tài liệu' : 'Đóng trình phát') : (isArticleLesson ? 'Xem tài liệu' : 'Xem đoạn trích')}
                    >
                      {isArticleLesson ? (
                        <FileText className={cn('w-2.5 h-2.5', isOpen && 'animate-pulse')} />
                      ) : (
                        <Play className={cn('w-2.5 h-2.5 fill-current ml-0.5', isOpen && 'animate-pulse')} />
                      )}
                    </button>
                    
                    <span className='text-[11px] font-bold text-blue-700 select-none'>
                      {chunk.title || `Phân đoạn ${chunk.chunkIndex + 1}`}
                    </span>

                    {!isArticleLesson && onSeek && (
                      <button
                        type='button'
                        onClick={(e) => {
                          e.stopPropagation()
                          onSeek(chunk.startTime || '00:00')
                        }}
                        className='flex h-6 w-6 items-center justify-center rounded-full bg-white text-blue-400 hover:bg-blue-600 hover:text-white transition-all border border-blue-100 hover:border-blue-600 ml-1 shadow-sm'
                        title='Tua video chính tới đoạn này'
                      >
                        <Sparkles className='w-3 h-3' />
                      </button>
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent side='top' className='bg-slate-900 text-white border-none text-[10px] px-2 py-1'>
                  <p className='font-bold uppercase tracking-tight'>
                    {isArticleLesson ? (chunk.title || `Phân đoạn ${chunk.chunkIndex + 1}`) : chunk.timestamp}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </p>

      {isArticleLesson ? (
        openChunkId ? (
          <div className='mt-2 rounded-2xl overflow-hidden shadow-2xl border border-blue-100/50 bg-white animate-in slide-in-from-top-2 duration-300'>
            <RemediationArticleViewer lessonId={lessonId} />
          </div>
        ) : null
      ) : (
        chunks.map((chunk) => (
          <Collapsible key={chunk.id} open={openChunkId === chunk.id}>
            <CollapsibleContent className='overflow-hidden animate-in slide-in-from-top-2 duration-300'>
              <div className='mt-2 rounded-2xl overflow-hidden shadow-2xl border border-blue-100/50 bg-white'>
                <RemediationVideoPlayer
                  lessonId={lessonId}
                  chunk={chunk}
                  subtitlesRaw={subtitlesRaw}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))
      )}
    </div>
  )
}

export default StudentExplanationRemediation
