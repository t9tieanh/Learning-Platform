/* eslint-disable jsx-a11y/media-has-caption */
import { useRef, useCallback } from 'react'
import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import { toast } from 'sonner'
import lessonStudentService from '@/services/course/lesson-student.service'

const VideoPlayer = ({ lesson }: { lesson: Lesson }) => {
  const backEndUri = import.meta.env.VITE_BACKEND_URI as string
  const { data } = useAuthStore()
  const videoRef = useRef<HTMLVideoElement>(null)

  // Track seek events to detect excessive skipping
  const seekTimestamps = useRef<number[]>([])
  const skipWarningShown = useRef(false)
  const videoCompletionMarked = useRef(false)

  const SKIP_DETECTION_WINDOW = 10000
  const SKIP_THRESHOLD = 3
  const COMPLETION_THRESHOLD = 0.9 // Mark as done when user reaches 90% of video

  const handleSeeking = useCallback(() => {
    if (!videoRef.current) return

    const now = Date.now()

    seekTimestamps.current = seekTimestamps.current.filter((timestamp) => now - timestamp < SKIP_DETECTION_WINDOW)

    seekTimestamps.current.push(now)

    if (seekTimestamps.current.length >= SKIP_THRESHOLD && !skipWarningShown.current) {
      skipWarningShown.current = true
      toast.warning('Tua liên tục có thể làm bạn bỏ lỡ những nội dung quan trọng.', {
        duration: 5000
      })

      setTimeout(() => {
        skipWarningShown.current = false
      }, 30000)
    }
  }, [])

  const markDoneVideo = useCallback(async () => {
    try {
      const response = await lessonStudentService.markDone(lesson.id)
      if (response && response.code === 200) {
        toast.success(response.message)
      } else {
        console.log('Failed to mark lesson as completed')
      }
    } catch (error) {
      console.error(error, 'Failed to mark lesson as completed')
    }
  }, [lesson.id])

  const handleTimeUpdate = useCallback(() => {
    if (!videoRef.current || videoCompletionMarked.current) return

    const { currentTime, duration } = videoRef.current
    if (!duration) return

    // Check if user has reached 90% of video
    const progress = currentTime / duration
    if (progress >= COMPLETION_THRESHOLD) {
      videoCompletionMarked.current = true
      markDoneVideo()
    }
  }, [markDoneVideo])

  return (
    <video
      ref={videoRef}
      src={
        lesson.introductionVideo
          ? `http://${lesson.introductionVideo}`
          : `${backEndUri}learning/lesson-student/${lesson.id}?token=${data?.accessToken}`
      }
      controls
      className='w-full h-full shadow-lg'
      title={lesson.title}
      onSeeking={handleSeeking}
      onTimeUpdate={handleTimeUpdate}
    />
  )
}

export default VideoPlayer
