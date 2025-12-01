/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/media-has-caption */
import { useRef, useCallback, useState } from 'react'
import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import { toast } from 'sonner'

const VideoPlayer = ({ lesson, markDoneVideo }: { lesson: Lesson; markDoneVideo: () => Promise<void> }) => {
  const backEndUri = import.meta.env.VITE_BACKEND_URI as string
  const { data } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)

  const seekTimestamps = useRef<number[]>([])
  const skipWarningShown = useRef(false)
  const videoCompletionMarked = useRef(false)
  const seekBlockedShown = useRef(false)
  const lastValidTime = useRef(0)

  const [showVideo, setShowVideo] = useState(!lesson.thumbnailUrl)

  const SKIP_DETECTION_WINDOW = 10000
  const SKIP_THRESHOLD = 3
  const COMPLETION_THRESHOLD = 0.9

  // Check if video seeking is allowed based on completion status
  const isSeekingAllowed = lesson.completionStatus && lesson.completionStatus !== 'NOT_STARTED'

  const handleSeeking = useCallback(() => {
    // Prevent seeking if lesson hasn't been started
    if (!isSeekingAllowed && videoRef.current) {
      // Restore to the last valid position before the seek
      videoRef.current.currentTime = lastValidTime.current
      if (!seekBlockedShown.current) {
        seekBlockedShown.current = true
        toast.error('⚠️ Bạn cần bắt đầu học bài này trước khi có thể tua video', {
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

  return (
    <div className='w-full h-full'>
      <style>{`
        video::-webkit-media-controls-panel {
          background-color: rgba(0, 0, 0, 0.8);
        }
        video::-webkit-media-controls-play-button {
          background-color: transparent;
        }
        ${
          !isSeekingAllowed
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
      {!showVideo && lesson?.thumbnailUrl ? (
        <img
          src={lesson?.thumbnailUrl}
          alt='Video Thumbnail'
          className='w-full h-full object-cover shadow-lg mb-4 cursor-pointer'
          onClick={() => setShowVideo(true)}
        />
      ) : (
        <video
          ref={videoRef}
          src={
            lesson.introductionVideo
              ? `http://${lesson.introductionVideo}`
              : `${backEndUri}learning/lesson-student/${lesson.id}?token=${data?.accessToken}`
          }
          controls
          autoPlay
          muted
          playsInline
          className='w-full h-full shadow-lg'
          title={lesson.title}
          onSeeking={handleSeeking}
          onTimeUpdate={handleTimeUpdate}
        />
      )}
    </div>
  )
}

export default VideoPlayer
