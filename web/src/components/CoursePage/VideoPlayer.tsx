import { useRef, useCallback, useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import { toast } from 'sonner'
import LearnovaVideoPlayer from '@/components/common/Video/LearnovaVideoPlayer'
import { parseSRT } from '@/utils/srtParser'
import lessonStudentService from '@/services/course/lesson-student.service'

import { LessonChunk } from '@/types/ai'

export interface VideoPlayerRef {
  seekTo: (time: number) => void
}

const VideoPlayer = forwardRef<VideoPlayerRef, {
  lesson: Lesson
  markDoneVideo: () => Promise<void>
  subtitlesRaw?: string
  chunks?: LessonChunk[]
  onShowChunkDetails?: (chunkId: string) => void
}>(({
  lesson,
  markDoneVideo,
  subtitlesRaw,
  chunks = [],
  onShowChunkDetails
}, ref) => {
  const { data } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)
  const [actualVideoUrl, setActualVideoUrl] = useState<string>('')

  const seekTimestamps = useRef<number[]>([])
  const skipWarningShown = useRef(false)
  const videoCompletionMarked = useRef(false)
  const seekBlockedShown = useRef(false)
  const lastValidTime = useRef(0)

  const [showVideo, setShowVideo] = useState(!lesson.thumbnailUrl)

  const SKIP_DETECTION_WINDOW = 10000
  const SKIP_THRESHOLD = 3
  const COMPLETION_THRESHOLD = 0.9

  // Expose seekTo method
  useImperativeHandle(ref, () => ({
    seekTo: (time: number) => {
      if (videoRef.current) {
        setShowVideo(true)
        videoRef.current.currentTime = time
        videoRef.current.play().catch(() => { })
      }
    }
  }))

  // Fetch presigned URL when lesson changes
  useEffect(() => {
    const fetchVideoUrl = async () => {
      if (lesson.introductionVideo) {
        setActualVideoUrl(lesson.introductionVideo || '')
        return
      }

      if (lesson.id && data?.accessToken) {
        try {
          const response = await lessonStudentService.getPresignedUrl(lesson.id, data.accessToken)
          if (response.code === 200) {
            setActualVideoUrl(response.result as string)
          }
        } catch (error) {
          console.error('Failed to fetch presigned URL:', error)
          toast.error('Không thể tải link video bài học. Vui lòng thử lại sau.')
        }
      }
    }

    fetchVideoUrl()
  }, [lesson.id, lesson.introductionVideo, data?.accessToken])

  // Parse subtitles if available
  const parsedSubtitles = useMemo(() => {
    if (!subtitlesRaw) return []
    return parseSRT(subtitlesRaw)
  }, [subtitlesRaw])

  // Check if video seeking is allowed based on completion status
  const isSeekingAllowed = lesson.completionStatus && lesson.completionStatus !== 'NOT_STARTED'

  const handleSeeking = useCallback(() => {
    // Prevent seeking if lesson hasn't been started
    if (!isSeekingAllowed && videoRef.current) {
      // Restore to the last valid position before the seek
      videoRef.current.currentTime = lastValidTime.current
      if (!seekBlockedShown.current) {
        seekBlockedShown.current = true
        toast.error('Bạn cần bắt đầu học bài này trước khi có thể tua video', {
          duration: 4000
        })
        setTimeout(() => (seekBlockedShown.current = false), 5000)
      }
      return
    }

    if (!videoRef.current) return

    const now = Date.now()
    seekTimestamps.current = seekTimestamps.current.filter((timestamp) => now - timestamp < SKIP_DETECTION_WINDOW)
    seekTimestamps.current.push(now)

    if (seekTimestamps.current.length >= SKIP_THRESHOLD && !skipWarningShown.current) {
      skipWarningShown.current = true
      toast.warning('Tua liên tục có thể làm bạn bỏ lỡ những nội dung quan trọng.', { duration: 5000 })
      setTimeout(() => (skipWarningShown.current = false), 30000)
    }
  }, [isSeekingAllowed])

  const handleTimeUpdate = useCallback(() => {
    // Track last valid playback time
    if (videoRef.current) {
      lastValidTime.current = videoRef.current.currentTime
    }

    if (!videoRef.current || videoCompletionMarked.current) return

    const { currentTime, duration } = videoRef.current
    if (!duration) return

    const progress = currentTime / duration
    if (progress >= COMPLETION_THRESHOLD) {
      videoCompletionMarked.current = true
      markDoneVideo()
    }
  }, [markDoneVideo])

  const videoSrc = useMemo(() => {
    return actualVideoUrl
  }, [actualVideoUrl])

  return (
    <div className='w-full h-full'>
      <style>{`
        video::-webkit-media-controls-panel {
          background-color: rgba(0, 0, 0, 0.8);
        }
        video::-webkit-media-controls-play-button {
          background-color: transparent;
        }
        ${!isSeekingAllowed
          ? `
          video::-webkit-media-controls-timeline,
          video::-webkit-media-controls-seek-back-button,
          video::-webkit-media-controls-seek-forward-button {
            display: none !important;
          }
          video::-moz-media-seek-backward-button,
          video::-moz-media-seek-forward-button {
            display: none !important;
          }
          input[type="range"] {
            pointer-events: none !important;
          }
        `
          : ''
        }
      `}</style>
      {!showVideo && lesson?.thumbnailUrl && !lesson.introductionVideo ? (
        <img
          src={lesson?.thumbnailUrl}
          alt='Video Thumbnail'
          className='w-full h-full object-cover shadow-lg mb-4 cursor-pointer'
          onClick={() => setShowVideo(true)}
        />
      ) : (
        <LearnovaVideoPlayer
          src={videoSrc}
          ref={videoRef}
          subtitles={parsedSubtitles}
          chunks={chunks}
          isSeekingAllowed={isSeekingAllowed}
          className='w-full h-full shadow-lg'
          isPiPEnabled={true}
          containerClassName='h-full'
          onSeeking={handleSeeking}
          onTimeUpdate={handleTimeUpdate}
          onShowChunkDetails={onShowChunkDetails}
        />
      )}
    </div>
  )
})

export default VideoPlayer
