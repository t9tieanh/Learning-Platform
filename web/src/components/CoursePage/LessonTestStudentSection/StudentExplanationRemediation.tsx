import React, { useMemo, useState } from 'react'
import { Play, ChevronUp, ChevronDown } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import RemediationVideoPlayer from './RemediationVideoPlayer'
import { cn } from '@/lib/utils'

interface StudentExplanationRemediationProps {
  explanation: string
  chunks: LessonChunk[]
  lessonId: string
  subtitlesRaw?: string | null
}

const StudentExplanationRemediation: React.FC<StudentExplanationRemediationProps> = ({
  explanation,
  chunks,
  lessonId,
  subtitlesRaw,
}) => {
  const [openChunkId, setOpenChunkId] = useState<string | null>(null)

  const parts = useMemo(() => {
    const regex = /@{{([a-f0-9-]{36})}}@/gi
    const result: (string | { chunkId: string })[] = []
    let lastIndex = 0
    let match

    while ((match = regex.exec(explanation)) !== null) {
      if (match.index > lastIndex) {
        result.push(explanation.substring(lastIndex, match.index))
      }
      result.push({ chunkId: match[1] })
      lastIndex = regex.lastIndex
    }

    if (lastIndex < explanation.length) {
      result.push(explanation.substring(lastIndex))
    }

    return result
  }, [explanation])

  const toggleChunk = (id: string) => {
    setOpenChunkId(openChunkId === id ? null : id)
  }

  if (parts.length === 0) {
    return <span className='text-gray-700'>{explanation}</span>
  }

  return (
    <div className='space-y-3'>
      <p className='text-[12.5px] font-medium text-gray-700 leading-relaxed'>
        {parts.map((part, i) => {
          if (typeof part === 'string') return <span key={i}>{part}</span>

          const chunk = chunks.find((c) => c.id === part.chunkId)
          if (!chunk) return <span key={i} className='text-slate-400 opacity-60'>[Nội dung cũ]</span>

          const isOpen = openChunkId === chunk.id

          return (
            <button
              key={i}
              type='button'
              onClick={() => toggleChunk(chunk.id)}
              className={cn(
                'inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded-lg border transition-all font-bold cursor-pointer group',
                isOpen 
                  ? 'bg-blue-600 border-blue-700 text-white shadow-md' 
                  : 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100 hover:border-blue-300'
              )}
            >
              <Play className={cn('w-2.5 h-2.5', isOpen ? 'fill-white' : 'fill-blue-600')} />
              <span className='text-[10px] md:text-[11px] leading-none'>
                {isOpen ? 'Đang xem' : `Xem lại ${chunk.timestamp}`}
              </span>
              {isOpen ? <ChevronUp className='w-3 h-3 ml-0.5' /> : <ChevronDown className='w-3 h-3 ml-0.5' />}
            </button>
          )
        })}
      </p>

      {chunks.map((chunk) => (
        <Collapsible key={chunk.id} open={openChunkId === chunk.id}>
          <CollapsibleContent className='overflow-hidden animate-in slide-in-from-top-2 duration-300'>
            <div className='mt-2 rounded-2xl overflow-hidden'>
               <RemediationVideoPlayer 
                  lessonId={lessonId} 
                  chunk={chunk} 
                  subtitlesRaw={subtitlesRaw} 
               />
            </div>
          </CollapsibleContent>
        </Collapsible>
      ))}
    </div>
  )
}

export default StudentExplanationRemediation
