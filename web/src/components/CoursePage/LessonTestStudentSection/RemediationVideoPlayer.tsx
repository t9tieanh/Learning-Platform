import React, { useEffect, useState, useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import LearnovaVideoPlayer from '@/components/common/Video/LearnovaVideoPlayer'
import { LessonChunk } from '@/types/ai'
import lessonStudentService from '@/services/course/lesson-student.service'
import { parseSRT } from '@/utils/srtParser'
import { timeToSeconds } from '@/utils/time/time.utils'
import { toast } from 'sonner'

interface RemediationVideoPlayerProps {
  lessonId: string
  chunk: LessonChunk
  subtitlesRaw?: string | null
}

const RemediationVideoPlayer: React.FC<RemediationVideoPlayerProps> = ({
  lessonId,
  chunk,
  subtitlesRaw,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const startTime = useMemo(() => timeToSeconds(chunk.startTime), [chunk.startTime])
  const endTime = useMemo(() => timeToSeconds(chunk.endTime), [chunk.endTime])

  useEffect(() => {
    let cancelled = false
    const fetchUrl = async () => {
      setLoading(true)
      try {
        const res = await lessonStudentService.getPresignedUrl(lessonId)
        if (!cancelled && res.code === 200) {
          setVideoUrl(res.result || null)
        }
      } catch (err) {
        console.error('Failed to fetch remediation video url', err)
        toast.error('Không thể tải video xem lại.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchUrl()
    return () => { cancelled = true }
  }, [lessonId])

  const parsedSubtitles = useMemo(() => {
    if (!subtitlesRaw) return []
    try {
      return parseSRT(subtitlesRaw)
    } catch {
      return []
    }
  }, [subtitlesRaw])

  // Handle boundary constraints
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      if (endTime && video.currentTime >= endTime) {
        video.pause()
        video.currentTime = startTime // Reset to start of chunk
      }
    }

    const handleLoadedMetadata = () => {
      video.currentTime = startTime
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
    }
  }, [startTime, endTime])

  if (loading) {
    return (
      <div className='aspect-video w-full flex items-center justify-center bg-slate-900 rounded-2xl border border-white/10'>
        <Loader2 className='w-6 h-6 text-blue-500 animate-spin' />
      </div>
    )
  }

  if (!videoUrl) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className='overflow-hidden rounded-2xl border border-blue-200/50 shadow-xl bg-black'
    >
      <LearnovaVideoPlayer
        ref={videoRef}
        src={videoUrl}
        subtitles={parsedSubtitles}
        chunks={[chunk]}
        isSeekingAllowed={true}
        containerClassName='aspect-video h-auto'
      />
      <div className='bg-blue-600 px-4 py-2 flex items-center justify-between'>
        <span className='text-[10px] font-bold text-white tracking-widest truncate max-w-[70%]'>
          {chunk.title || 'Đang xem lại kiến thức quan trọng'}
        </span>
        <span className='text-[10px] font-medium text-blue-100 flex-shrink-0 ml-2'>
          {chunk.timestamp}
        </span>
      </div>
    </motion.div>
  )
}

export default RemediationVideoPlayer
