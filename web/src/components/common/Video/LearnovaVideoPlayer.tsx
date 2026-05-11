import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring } from 'framer-motion'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import learnovaLogo from '@/assets/images/logo1.png'
import { cn } from '@/lib/utils'
import { Play, Pause, Volume2, VolumeX, Maximize, Sparkles, Bot, Languages, MessageSquare } from 'lucide-react'
import { LessonChunk } from '@/types/ai'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { formatVideoTime, timeToSeconds } from '@/utils/time/time.utils'

export interface SubtitleEntry {
    start: number
    end: number
    text: string
}

interface LearnovaVideoPlayerProps {
    src: string
    subtitles?: SubtitleEntry[]
    chunks?: LessonChunk[]
    isPiPEnabled?: boolean
    isSeekingAllowed?: boolean
    className?: string
    containerClassName?: string
    onSeeking?: (e: React.SyntheticEvent<HTMLVideoElement>) => void
    onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void
    onShowChunkDetails?: (chunkId: string) => void
    clipStartTime?: number
    clipEndTime?: number
}


const LearnovaVideoPlayer = forwardRef<HTMLVideoElement | null, LearnovaVideoPlayerProps>(
    ({ src, subtitles = [], chunks = [], isPiPEnabled = false, isSeekingAllowed = true, className = '', containerClassName = '', onSeeking, onTimeUpdate, onShowChunkDetails, clipStartTime, clipEndTime }, ref) => {
        const [isVideoLoading, setIsVideoLoading] = useState(true)
        const [isPlaying, setIsPlaying] = useState(false)
        const [duration, setDuration] = useState(0)
        const [currentTime, setCurrentTime] = useState(0)
        const [volume, setVolume] = useState(1)
        const [isMuted, setIsMuted] = useState(false)
        const [showControls, setShowControls] = useState(true)
        const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null)
        const [isPiP, setIsPiP] = useState(false)
        const [isBuffering, setIsBuffering] = useState(false)
        const [lastAction, setLastAction] = useState<'play' | 'pause' | null>(null)
        const [showSubtitles, setShowSubtitles] = useState(true)

        // Tooltip States
        const [hoverTime, setHoverTime] = useState<number | null>(null)
        const [hoverSegment, setHoverSegment] = useState<any | null>(null)

        // Motion values for ultra-smooth tracking
        const xRaw = useMotionValue(0)
        const xSmooth = useSpring(xRaw, { stiffness: 1000, damping: 50, restDelta: 0.001 })

        const actionTimerRef = useRef<NodeJS.Timeout | null>(null)

        const videoContainerRef = useRef<HTMLDivElement>(null)
        const internalVideoRef = useRef<HTMLVideoElement>(null)
        const controlsTimerRef = useRef<NodeJS.Timeout | null>(null)

        useImperativeHandle(ref, () => internalVideoRef.current!)

        useEffect(() => {
            if (!isPiPEnabled) {
                setIsPiP(false)
                return
            }
            const observer = new IntersectionObserver(([entry]) => setIsPiP(!entry.isIntersecting), { threshold: 0.1 })
            if (videoContainerRef.current) observer.observe(videoContainerRef.current)
            return () => observer.disconnect()
        }, [isPiPEnabled])

        useEffect(() => {
            setIsVideoLoading(true)
        }, [src])

        const togglePlay = useCallback(() => {
            if (!internalVideoRef.current) return

            if (actionTimerRef.current) clearTimeout(actionTimerRef.current)

            if (internalVideoRef.current.paused) {
                internalVideoRef.current.play()
                setIsPlaying(true)
                setLastAction('play')
            } else {
                internalVideoRef.current.pause()
                setIsPlaying(false)
                setLastAction('pause')
            }

            actionTimerRef.current = setTimeout(() => setLastAction(null), 800)
        }, [])

        const handleMediaLoad = () => {
            setIsVideoLoading(false)
            if (internalVideoRef.current) {
                setDuration(internalVideoRef.current.duration)
            }
        }

        const handleInternalTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
            const video = e.currentTarget
            const time = video.currentTime
            
            // Clip boundary enforcement
            if (clipEndTime && time >= clipEndTime) {
                video.pause()
                video.currentTime = clipStartTime || 0
                setIsPlaying(false)
                return
            }
            if (clipStartTime && time < clipStartTime) {
                video.currentTime = clipStartTime
            }

            setCurrentTime(time)

            const sub = subtitles.find((s) => time >= s.start && time <= s.end)
            if (sub?.text !== activeSubtitle) {
                setActiveSubtitle(sub ? sub.text : null)
            }
            if (onTimeUpdate) onTimeUpdate(e)
        }

        const handleSeek = (time: number) => {
            if (internalVideoRef.current) {
                internalVideoRef.current.currentTime = time
            }
        }

        const resetControlsTimer = () => {
            setShowControls(true)
            if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current)
            controlsTimerRef.current = setTimeout(() => {
                if (isPlaying) setShowControls(false)
            }, 3000)
        }

        const handleFullscreen = () => {
            if (videoContainerRef.current?.requestFullscreen) {
                videoContainerRef.current.requestFullscreen()
            }
        }

        // Timeline Segments Calculation
        const segments = useMemo(() => {
            if (clipStartTime !== undefined && clipEndTime !== undefined) {
                return [{ id: 'clip', start: clipStartTime, end: clipEndTime, title: 'Đoạn trích', summary: null }]
            }

            if (chunks.length === 0 || duration === 0) {
                return [{ id: 'default', start: 0, end: duration, title: 'Bài học', summary: null }]
            }

            return chunks.map((chunk, index) => {
                const start = timeToSeconds(chunk.startTime)
                const end = index === chunks.length - 1
                    ? duration
                    : timeToSeconds(chunks[index + 1].startTime)

                return {
                    id: chunk.id,
                    start,
                    end: Math.min(end, duration),
                    title: chunk.title || `Phần ${index + 1}`,
                    summary: chunk.summary
                }
            })
        }, [chunks, duration])

        // Current Segment Detection
        const currentSegment = useMemo(() => {
            return segments.find(seg => currentTime >= seg.start && currentTime < seg.end) || segments[0]
        }, [segments, currentTime])

        return (
            <div ref={videoContainerRef} className='w-full aspect-video relative'>
                <motion.div
                    layout
                    drag={isPiP}
                    dragConstraints={{ left: -window.innerWidth + 300, right: 0, top: -window.innerHeight + 200, bottom: 0 }}
                    dragElastic={0.1}
                    dragMomentum={false}
                    animate={isPiP ? undefined : { x: 0, y: 0 }}
                    className={cn(
                        'bg-black group/player select-none touch-none overflow-hidden rounded-3xl shadow-2xl border-[0.5px] border-white/10',
                        containerClassName,
                        isPiP ? 'fixed bottom-6 right-6 w-[280px] h-[158px] z-[9999] shadow-[0_20px_60px_rgba(0,0,0,0.8)] border-blue-500/40 cursor-move ring-2 ring-black/50' : 'relative w-full h-full inset-0'
                    )}
                    onMouseMove={resetControlsTimer}
                    onClick={resetControlsTimer}
                >
                    <video
                        src={src || ''}
                        ref={internalVideoRef}
                        className='w-full h-full object-contain'
                        onLoadedData={handleMediaLoad}
                        onTimeUpdate={handleInternalTimeUpdate}
                        onSeeking={(e) => {
                            setIsBuffering(true)
                            if (onSeeking) onSeeking(e)
                        }}
                        onSeeked={() => setIsBuffering(false)}
                        onWaiting={() => setIsBuffering(true)}
                        onPlaying={() => setIsBuffering(false)}
                        onCanPlay={() => setIsBuffering(false)}
                        onPlay={() => setIsPlaying(true)}
                        onPause={() => setIsPlaying(false)}
                        onClick={togglePlay}
                    />

                    {/* Subtitles Overlay */}
                    <AnimatePresence>
                        {showSubtitles && activeSubtitle && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className={cn(
                                    'absolute left-0 right-0 flex justify-center px-8 z-20 pointer-events-none',
                                    isPiP ? 'bottom-16' : 
                                    clipStartTime !== undefined ? 'bottom-20' : 'bottom-24'
                                )}
                            >
                                <div className={cn(
                                    'bg-black/60 backdrop-blur-xl text-white text-center font-bold shadow-2xl border border-white/10',
                                    isPiP ? 'px-3 py-1.5 rounded-xl text-[10px] leading-tight max-w-[90%]' : 
                                    clipStartTime !== undefined ? 'px-4 py-2 rounded-xl text-xs md:text-sm max-w-[85%]' :
                                    'px-6 py-3 rounded-2xl text-lg md:text-xl'
                                )}>
                                    {activeSubtitle}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Loading State */}
                    {isVideoLoading && (
                        <div className='absolute inset-0 flex items-center justify-center bg-gray-900/90 backdrop-blur-sm z-50'>
                            <div className='flex flex-col items-center gap-4'>
                                <motion.img
                                    animate={{ y: [0, -10, 0], scale: [1, 1.1, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                    src={learnovaLogo}
                                    alt='Loading'
                                    className='w-16 h-16 object-contain'
                                />
                                <LoadingDots text='Chờ learnova một tí nhé...' className='text-blue-400 font-bold text-sm' />
                            </div>
                        </div>
                    )}

                    {/* Action Icon Overlay (Play/Pause) */}
                    <AnimatePresence>
                        {lastAction && (
                            <motion.div
                                key={lastAction}
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1.2 }}
                                exit={{ opacity: 0, scale: 1.5 }}
                                transition={{ duration: 0.4 }}
                                className='absolute inset-0 flex items-center justify-center z-40 pointer-events-none'
                            >
                                <div className={cn('bg-black/30 backdrop-blur-sm rounded-full', isPiP ? 'p-3' : 'p-6')}>
                                    {lastAction === 'play' ? (
                                        <Play className={cn('text-white fill-current', isPiP ? 'w-6 h-6' : 'w-12 h-12')} />
                                    ) : (
                                        <Pause className={cn('text-white fill-current', isPiP ? 'w-6 h-6' : 'w-12 h-12')} />
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Buffering Indicator */}
                    <AnimatePresence>
                        {isBuffering && !isVideoLoading && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className='absolute inset-0 flex items-center justify-center z-40 bg-black/10'
                            >
                                <div className='bg-black/40 backdrop-blur-md p-4 rounded-full border border-white/10'>
                                    <img src={learnovaLogo} alt="Learnova" className='w-10 h-10 object-contain filter drop-shadow-sm' />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Custom Controls UI */}
                    <div
                        className={cn(
                            'absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 transition-opacity duration-300 z-30 flex flex-col justify-end p-5',
                            showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
                        )}
                        onClick={(e) => {
                            // Only toggle play if clicking the empty area of the overlay
                            if (e.target === e.currentTarget) {
                                togglePlay()
                            }
                        }}
                    >
                        {/* Timeline with Chapters */}
                        <div
                            className={cn(
                                'w-full mb-5 relative h-3 flex items-end group/timeline',
                                !isSeekingAllowed && 'opacity-90'
                            )}
                            onMouseMove={(e) => {
                                if (isPiP) return
                                const rect = e.currentTarget.getBoundingClientRect()
                                const x = e.clientX - rect.left
                                const pct = Math.max(0, Math.min(1, x / rect.width))
                                const time = pct * duration

                                // 1. Update motion value (Zero-lag position)
                                xRaw.set(x)

                                // 2. Only update state (re-render) if segment changes or time significantly changes
                                const seg = segments.find(s => time >= s.start && time < s.end) || segments[0]
                                if (seg.id !== hoverSegment?.id) {
                                    setHoverSegment(seg)
                                }
                                setHoverTime(time)
                            }}
                            onMouseLeave={() => {
                                setHoverTime(null)
                                setHoverSegment(null)
                            }}
                        >
                            {/* Hover Tooltip - Large Screen */}
                            {!isPiP && chunks.length > 0 && hoverSegment && hoverTime !== null && (
                                <motion.div
                                    style={{ x: xSmooth, left: -144 }} // Centering by subtracting half width
                                    className='absolute bottom-full mb-4 z-40 w-72 pointer-events-none'
                                >
                                    <div className='bg-[#111]/90 backdrop-blur-2xl border border-white/10 shadow-3xl p-4 rounded-2xl'>
                                        <div className='flex flex-col gap-2'>
                                            <div className='flex items-center gap-2'>
                                                <div className='w-1.5 h-4 bg-blue-500 rounded-full' />
                                                <span className='font-bold text-white text-[13px] tracking-tight leading-none'>{hoverSegment.title}</span>
                                            </div>
                                            {hoverSegment.summary && <p className='text-[11px] text-white/90 leading-relaxed font-normal'>{hoverSegment.summary}</p>}
                                            <div className='flex items-center justify-between gap-2 mt-2 pt-2 border-t border-white/5'>
                                                <span className='px-2 py-0.5 rounded-md bg-white/5 text-[9px] text-blue-400 font-bold uppercase tracking-wider'>
                                                    Bắt đầu: {formatVideoTime(hoverSegment.start)}
                                                </span>
                                                <span className='text-[9px] text-white/40 font-bold uppercase tracking-wider'>
                                                    {formatVideoTime(hoverTime || 0)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Tooltip Arrow */}
                                    <div className='absolute left-1/2 -bottom-2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white/10' />
                                </motion.div>
                            )}

                            <div className='absolute inset-0 flex gap-0.5 items-end'>
                                {segments.map((seg: any, i: number) => {
                                    const isClip = clipStartTime !== undefined && clipEndTime !== undefined
                                    const baseDuration = isClip ? (clipEndTime - clipStartTime) : duration
                                    const startPct = isClip ? 0 : (seg.start / duration) * 100
                                    const endPct = isClip ? 100 : (seg.end / duration) * 100
                                    const widthPct = endPct - startPct
                                    const isPlayed = currentTime >= seg.end
                                    const isCurrent = currentTime >= seg.start && currentTime < seg.end
                                    const playedPct = isCurrent 
                                        ? ((currentTime - seg.start) / (seg.end - seg.start)) * 100 
                                        : (isPlayed ? 100 : 0)

                                    return (
                                        <div
                                            key={i}
                                            className={cn(
                                                'h-1 grow hover:h-2 transition-all duration-200 rounded-full bg-white/20 relative overflow-hidden',
                                                isSeekingAllowed ? 'cursor-pointer' : 'cursor-default'
                                            )}
                                            style={{ width: `${widthPct}%` }}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                if (isSeekingAllowed) {
                                                    const rect = e.currentTarget.getBoundingClientRect()
                                                    const x = e.clientX - rect.left
                                                    const clickedPct = x / rect.width
                                                    const seekTime = seg.start + (clickedPct * (seg.end - seg.start))
                                                    handleSeek(seekTime)
                                                }
                                            }}
                                        >
                                            <div
                                                className='absolute top-0 left-0 h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]'
                                                style={{ width: `${playedPct}%` }}
                                            />
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Control Buttons */}
                        <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-3 md:gap-5'>
                                <button onClick={togglePlay} className='text-white hover:text-blue-400 transition-colors'>
                                    {isPlaying ? <Pause className='w-6 h-6 fill-current' /> : <Play className='w-6 h-6 fill-current' />}
                                </button>

                                <div className='flex items-center gap-2 md:gap-3 text-white font-normal text-[11px] tabular-nums'>
                                    <span className='text-blue-400'>
                                        {clipStartTime !== undefined 
                                            ? formatVideoTime(Math.max(0, currentTime - clipStartTime)) 
                                            : formatVideoTime(currentTime)}
                                    </span>
                                    <span className='opacity-30'>/</span>
                                    <span>
                                        {clipStartTime !== undefined && clipEndTime !== undefined
                                            ? formatVideoTime(clipEndTime - clipStartTime)
                                            : formatVideoTime(duration)}
                                    </span>
                                </div>

                                <div className='flex items-center gap-3 group/volume'>
                                    <button onClick={() => setIsMuted(!isMuted)} className='text-white hover:text-blue-400 transition-colors'>
                                        {isMuted || volume === 0 ? <VolumeX className='w-5 h-5' /> : <Volume2 className='w-5 h-5' />}
                                    </button>
                                    <input
                                        type='range'
                                        min='0' max='1' step='0.1'
                                        value={isMuted ? 0 : volume}
                                        onChange={(e) => {
                                            const v = parseFloat(e.target.value)
                                            setVolume(v)
                                            if (internalVideoRef.current) internalVideoRef.current.volume = v
                                            setIsMuted(v === 0)
                                        }}
                                        className='w-16 accent-blue-500 h-0.5 rounded-full cursor-pointer hidden group-hover/volume:block transition-all'
                                    />
                                </div>

                                {!isPiP && clipStartTime === undefined && (
                                    <div className='hidden sm:flex items-center gap-2 border-l border-white/10 pl-5 ml-2'>
                                        <Sparkles className='w-3 h-3 text-blue-400' />
                                        <span className='text-[10px] text-white/70 font-medium truncate max-w-[150px]'>
                                            {currentSegment.title}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className='flex items-center gap-3 md:gap-5'>
                                <button 
                                    onClick={() => setShowSubtitles(!showSubtitles)} 
                                    className={cn(
                                        'transition-colors',
                                        showSubtitles ? 'text-blue-400' : 'text-white/60 hover:text-white'
                                    )}
                                    title={showSubtitles ? 'Tắt phụ đề' : 'Bật phụ đề'}
                                >
                                    <Languages className='w-5 h-5' />
                                </button>
                                <button onClick={handleFullscreen} className='text-white hover:text-blue-400 transition-colors'>
                                    {isPiP ? <Bot className='w-5 h-5' /> : <Maximize className='w-5 h-5' />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        )
    }
)

export default LearnovaVideoPlayer
