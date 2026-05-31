import React, { useMemo } from 'react'
import { Play } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { LessonChunk } from '@/types/ai'
import { LessonType } from '@/types/lesson'
import chunkCitationUtil from '@/utils/chunkCitation.util'

interface ExplanationCitationProps {
  text: string
  chunks: LessonChunk[]
  handleSeek?: (startTime: string | null) => void
  lessonType?: LessonType
}

const ExplanationCitation: React.FC<ExplanationCitationProps> = ({
  text,
  chunks,
  handleSeek,
  lessonType,
}) => {
  const parts = useMemo(() => {
    const normalized = chunkCitationUtil.normalizeChunkCitationText(text)
    // Regex for @{{uuid}}@
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
        if (typeof part === 'string') return <span key={i}>{part}</span>

        const chunk = chunks.find((c) => c.id === part.chunkId)
        if (!chunk)
          return (
            <span key={i} className='text-slate-400 opacity-60'>
              [Nội dung cũ]
            </span>
          )

        return (
          <TooltipProvider key={i} delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type='button'
                  onClick={() => handleSeek?.(chunk.startTime)}
                  className='inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all font-bold group cursor-pointer'
                >
                  {lessonType === LessonType.VIDEO && (
                    <Play className='w-2 h-2 fill-blue-600' />
                  )}
                  <span className='text-[9px] md:text-[10px] leading-none'>
                    {chunk.title || `Phân đoạn ${chunk.chunkIndex + 1}`}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent
                side='top'
                className='bg-slate-900 text-white border-0 text-[10px] rounded-lg px-2 py-1 shadow-xl'
              >
                Xem lại: {chunk.title || `Phân đoạn ${chunk.chunkIndex + 1}`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}
    </>
  )
}

export default ExplanationCitation
