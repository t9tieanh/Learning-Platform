import { useMemo } from 'react'
import { Play } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { LessonChunk } from '@/types/ai'
import { LessonType } from '@/types/lesson'
import chunkCitationUtil from '@/utils/chunkCitation.util'

interface AdminExplanationCitationProps {
  text: string
  chunks: LessonChunk[]
  onSeek?: (startTime: string | null) => void
  lessonType?: LessonType
}

export function AdminExplanationCitation({
  text,
  chunks,
  onSeek,
  lessonType = LessonType.VIDEO,
}: AdminExplanationCitationProps) {
  const parts = useMemo(() => {
    const normalized = chunkCitationUtil.normalizeChunkCitationText(text)
    const regex = /@{{([a-f0-9-]{36})}}@/gi
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
  }, [text])

  if (parts.length === 0) return <>{text}</>

  return (
    <>
      {parts.map((part, i) => {
        if (typeof part === 'string') return <span key={i} dangerouslySetInnerHTML={{ 
          __html: part.includes('&lt;') ? new DOMParser().parseFromString(part, 'text/html').documentElement.textContent || '' : part 
        }} />

        const chunk = chunks.find((c) => c.id === part.chunkId)
        if (!chunk) {
          return (
            <span key={i} className='text-slate-400 opacity-60'>
              [Nội dung cũ]
            </span>
          )
        }

        const label = chunk.title || `Phân đoạn ${chunk.chunkIndex + 1}`

        return (
          <TooltipProvider key={i} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => onSeek?.(chunk.startTime)}
                  className='mx-1 inline-flex cursor-pointer items-center gap-1 rounded-md border border-blue-200 bg-blue-50 px-1.5 py-0.5 font-bold text-blue-700 transition-all hover:border-blue-300 hover:bg-blue-100'
                >
                  {lessonType === LessonType.VIDEO && (
                    <Play className='h-2 w-2 fill-blue-600' />
                  )}
                  <span className='text-[9px] leading-none md:text-[10px]'>{label}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side='top'
                className='rounded-lg border-0 bg-slate-900 px-2 py-1 text-[10px] text-white shadow-xl'
              >
                Tua tới: {label}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </>
  )
}
