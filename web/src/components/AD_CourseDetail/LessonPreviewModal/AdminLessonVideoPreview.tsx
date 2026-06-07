import type { RefObject } from 'react'
import LearnovaVideoPlayer, { type SubtitleEntry } from '@/components/common/Video/LearnovaVideoPlayer'
import type { LessonChunk } from '@/types/ai'

interface AdminLessonVideoPreviewProps {
  videoSrc: string
  videoRef: RefObject<HTMLVideoElement | null>
  subtitles: SubtitleEntry[]
  chunks?: LessonChunk[]
}

export function AdminLessonVideoPreview({
  videoSrc,
  videoRef,
  subtitles,
  chunks = [],
}: AdminLessonVideoPreviewProps) {
  return (
    <div className='relative'>
      <div className='overflow-hidden rounded-xl bg-black shadow-md ring-1 ring-slate-200/80'>
        <LearnovaVideoPlayer
          src={videoSrc}
          ref={videoRef}
          subtitles={subtitles}
          chunks={chunks}
          isPiPEnabled
          containerClassName='pb-0'
        />
      </div>
    </div>
  )
}
