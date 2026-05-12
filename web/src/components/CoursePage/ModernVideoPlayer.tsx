import { useRef, useCallback, useState, useMemo, forwardRef, useImperativeHandle, useEffect } from 'react'
import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import { toast } from 'sonner'
import LearnovaVideoPlayer from '@/components/common/Video/LearnovaVideoPlayer'
import { parseSRT } from '@/utils/srtParser'
import lessonStudentService from '@/services/course/lesson-student.service'
import { LessonChunk } from '@/types/ai'
import { timeToSeconds } from '@/utils/time/time.utils'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react'
import VideoQuizOverlay from './VideoQuizOverlay'
import { useLessonProgressStore } from '@/stores/useLessonProgressStore'

export interface VideoPlayerRef {
    seekTo: (time: number) => void
}

const ModernVideoPlayer = forwardRef<VideoPlayerRef, {
    lesson: Lesson
    markDoneVideo: () => Promise<void>
    subtitlesRaw?: string
    chunks?: LessonChunk[]
    onShowChunkDetails?: (chunkId: string) => void
    onProgress?: (percent: number) => void
}>(({
    lesson,
    markDoneVideo,
    subtitlesRaw,
    chunks = [],
    onShowChunkDetails,
    onProgress
}, ref) => {
    const { data } = useAuthStore()
    const videoRef = useRef<HTMLVideoElement>(null)
    const [actualVideoUrl, setActualVideoUrl] = useState<string>('')
    const videoCompletionMarked = useRef(false)
    const [showVideo, setShowVideo] = useState(!lesson.thumbnailUrl)

    const [currentQuizChunk, setCurrentQuizChunk] = useState<LessonChunk | null>(null)
    const [currentChunkTitle, setCurrentChunkTitle] = useState<string | null>(null)
    const [isPromptCollapsed, setIsPromptCollapsed] = useState(false)
    const shownQuizIds = useRef<Set<string>>(new Set())
    const lastCheckTime = useRef(0)

    const updateProgress = useLessonProgressStore(state => state.updateProgress)
    const getProgress = useLessonProgressStore(state => state.getProgress)
    
    // Use a ref to store saved progress to avoid re-renders when it changes in the store
    const savedProgressRef = useRef(getProgress(lesson.id))
    const [maxTimeWatched, setMaxTimeWatched] = useState(savedProgressRef.current.maxTimeWatched)
    const isSeekingToSaved = useRef(false)
    useEffect(() => {
        const progress = getProgress(lesson.id)
        savedProgressRef.current = progress
        setMaxTimeWatched(progress.maxTimeWatched)
        isSeekingToSaved.current = false
    }, [lesson.id, getProgress])

    const isCompleted = lesson.completionStatus === 'COMPLETED'

    const COMPLETION_THRESHOLD = 0.6

    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => {
            if (videoRef.current) {
                // Allow seeking back or seeking to max reached time
                const targetTime = isCompleted ? time : Math.min(time, maxTimeWatched + 1)
                setShowVideo(true)
                videoRef.current.currentTime = targetTime
                videoRef.current.play().catch(() => { })
            }
        }
    }))

    useEffect(() => {
        const fetchVideoData = async () => {
            if (lesson.introductionVideo) {
                setActualVideoUrl(lesson.introductionVideo || '')
                return
            }

            if (lesson.id && data?.accessToken) {
                try {
                    const urlResponse = await lessonStudentService.getPresignedUrl(lesson.id)
                    if (urlResponse.code === 200) {
                        setActualVideoUrl(urlResponse.result || '')
                    }
                } catch (error) {
                    console.error('Video access error:', error)
                    toast.error('Không thể xác thực quyền truy cập video.')
                }
            }
        }

        fetchVideoData()
    }, [lesson.id, lesson.introductionVideo, data?.accessToken])

    // Auto resume video from last position - ONLY ONCE when URL is ready
    useEffect(() => {
        if (actualVideoUrl && videoRef.current && !isSeekingToSaved.current) {
            const progress = getProgress(lesson.id)
            if (progress.lastCurrentTime > 0) {
                isSeekingToSaved.current = true
                videoRef.current.currentTime = progress.lastCurrentTime
            }
        }
    }, [actualVideoUrl, lesson.id, getProgress])

    const parsedSubtitles = useMemo(() => {
        if (!subtitlesRaw) return []
        return parseSRT(subtitlesRaw)
    }, [subtitlesRaw])

    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        const { currentTime, duration } = video
        if (!duration) return

        // Track max time reached in this session
        if (currentTime > maxTimeWatched && !isCompleted) {
            setMaxTimeWatched(currentTime)
            updateProgress(lesson.id, { maxTimeWatched: currentTime })
        }

        // Periodically update current progress (every 2 seconds)
        if (Math.abs(currentTime - lastCheckTime.current) > 2) {
            updateProgress(lesson.id, { lastCurrentTime: currentTime })
            lastCheckTime.current = currentTime
        }

        const currentPercent = (currentTime / duration) * 100
        onProgress?.(currentPercent)

        if (!videoCompletionMarked.current) {
            if (currentPercent >= COMPLETION_THRESHOLD * 100) {
                videoCompletionMarked.current = true
                markDoneVideo()
            }
        }

        if (chunks.length > 0) {
            const closest = chunks.reduce((prev, curr) => {
                const prevStart = timeToSeconds(prev.startTime)
                const currStart = timeToSeconds(curr.startTime)
                return Math.abs(currStart - currentTime) < Math.abs(prevStart - currentTime) ? curr : prev
            })
            if (closest.title !== currentChunkTitle) {
                setCurrentChunkTitle(closest.title)
            }
        }
        lastCheckTime.current = currentTime
    }, [markDoneVideo, chunks, currentChunkTitle, maxTimeWatched, isCompleted, onProgress])

    const handleSeekingSync = useCallback(() => {
        if (!videoRef.current || isCompleted) return

        // If user tries to seek forward beyond what they've watched
        if (videoRef.current.currentTime > maxTimeWatched + 1) {
            videoRef.current.currentTime = maxTimeWatched
            toast.warning('Vui lòng xem tuần tự nội dung bài học. Bạn có thể làm bài kiểm tra sau khi xem đạt 70%.', {
                id: 'seek-blocked',
                duration: 3000
            })
        }
        lastCheckTime.current = videoRef.current.currentTime
    }, [maxTimeWatched, isCompleted])

    const startQuiz = useCallback(() => {
        const video = videoRef.current
        if (!video || chunks.length === 0) return

        const currentTime = video.currentTime

        const closestChunk = chunks.reduce((prev, curr) => {
            const prevStart = timeToSeconds(prev.startTime)
            const currStart = timeToSeconds(curr.startTime)
            return Math.abs(currStart - currentTime) < Math.abs(prevStart - currentTime) ? curr : prev
        })

        const chunkWithQuizzes = (closestChunk.quizzes && closestChunk.quizzes.length > 0)
            ? closestChunk
            : chunks.find(c => c.quizzes && c.quizzes.length > 0)

        if (chunkWithQuizzes) {
            video.pause()
            setCurrentQuizChunk(chunkWithQuizzes)
        }
    }, [chunks])

    const finishQuiz = useCallback((chunkId: string) => {
        shownQuizIds.current.add(chunkId)
        setCurrentQuizChunk(null)
        videoRef.current?.play().catch(() => { })
    }, [])

    const closeQuiz = useCallback(() => {
        setCurrentQuizChunk(null)
        videoRef.current?.play().catch(() => { })
    }, [])

    return (
        <div className='w-full h-full relative group/modern-player overflow-hidden rounded-[2rem] shadow-2xl'>
            {!showVideo && lesson?.thumbnailUrl && !lesson.introductionVideo ? (
                <img
                    src={lesson?.thumbnailUrl}
                    alt='Video Thumbnail'
                    className='w-full h-full object-cover shadow-lg mb-4 cursor-pointer'
                    onClick={() => setShowVideo(true)}
                />
            ) : (
                <>
                    <LearnovaVideoPlayer
                        src={actualVideoUrl}
                        ref={videoRef}
                        subtitles={parsedSubtitles}
                        chunks={chunks}
                        isSeekingAllowed={true}
                        className='w-full h-full shadow-lg'
                        isPiPEnabled={true}
                        containerClassName='h-full'
                        onTimeUpdate={handleTimeUpdate}
                        onSeeking={handleSeekingSync}
                        onShowChunkDetails={onShowChunkDetails}
                    />

                    <AnimatePresence>
                        {chunks.length > 0 && !currentQuizChunk && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className='absolute bottom-24 right-0 z-40'
                            >
                                <AnimatePresence mode='wait'>
                                    {!isPromptCollapsed ? (
                                        <motion.div
                                            key='expanded-prompt'
                                            initial={{ opacity: 0, x: 50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 50 }}
                                            className='flex items-center gap-2 pr-6'
                                        >
                                            <button
                                                onClick={() => setIsPromptCollapsed(true)}
                                                className='bg-white/90 backdrop-blur-md rounded-full p-2 shadow-lg border border-white/20 text-slate-400 hover:text-blue-600 transition-colors group/collapse'
                                            >
                                                <ChevronRight className='w-4 h-4' />
                                            </button>
                                            <div
                                                className='bg-white/90 backdrop-blur-xl border border-white/20 p-4 rounded-3xl shadow-2xl flex items-center gap-4 cursor-pointer hover:bg-white transition-all shadow-[0_15px_40px_rgba(0,0,0,0.2)] group/prompt'
                                                onClick={startQuiz}
                                            >
                                                <div className='w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover/prompt:scale-110 transition-transform'>
                                                    <CheckCircle2 className='w-6 h-6 text-white' />
                                                </div>
                                                <div className='flex flex-col pr-4'>
                                                    <span className='text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-0.5'>Ôn tập ngay</span>
                                                    <span className='text-xs font-semibold text-slate-700 max-w-[180px] truncate'>
                                                        {currentChunkTitle ? `Hỏi về: ${currentChunkTitle}` : 'Củng cố kiến thức vừa học?'}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <motion.button
                                            key='collapsed-prompt'
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: 20 }}
                                            onClick={() => setIsPromptCollapsed(false)}
                                            className='bg-blue-600 hover:bg-blue-700 text-white rounded-l-2xl p-3 shadow-xl transition-all flex items-center gap-2 pr-5 group'
                                        >
                                            <ChevronLeft className='w-5 h-5 group-hover:-translate-x-1 transition-transform' />
                                            <span className='text-[10px] font-bold uppercase tracking-widest'>Ôn tập</span>
                                        </motion.button>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        )}

                        {currentQuizChunk && (
                            <VideoQuizOverlay
                                chunk={currentQuizChunk}
                                allChunks={chunks}
                                maxTimeWatched={maxTimeWatched}
                                onSkip={() => finishQuiz(currentQuizChunk.id)}
                                onContinue={() => finishQuiz(currentQuizChunk.id)}
                                onClose={closeQuiz}
                                onSeek={(time) => {
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = time
                                        videoRef.current.play().catch(() => { })
                                        closeQuiz()
                                    }
                                }}
                            />
                        )}
                    </AnimatePresence>
                </>
            )}
        </div>
    )
})

export default ModernVideoPlayer
