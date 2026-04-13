import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { motion } from 'framer-motion'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import learnovaLogo from '@/assets/images/logo1.png'
import { cn } from '@/lib/utils'

export interface SubtitleEntry {
    start: number
    end: number
    text: string
}

interface LearnovaVideoPlayerProps {
    src: string
    subtitles?: SubtitleEntry[]
    isPiPEnabled?: boolean
    className?: string
    containerClassName?: string
    onSeeking?: (e: React.SyntheticEvent<HTMLVideoElement>) => void
    onTimeUpdate?: (e: React.SyntheticEvent<HTMLVideoElement>) => void
}

const LearnovaVideoPlayer = forwardRef<HTMLVideoElement | null, LearnovaVideoPlayerProps>(
    ({ src, subtitles = [], isPiPEnabled = false, className = '', containerClassName = '', onSeeking, onTimeUpdate }, ref) => {
        const [isVideoLoading, setIsVideoLoading] = useState(true)
        const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null)
        const [isPiP, setIsPiP] = useState(false)
        const videoContainerRef = useRef<HTMLDivElement>(null)
        const internalVideoRef = useRef<HTMLVideoElement>(null)

        useImperativeHandle(ref, () => internalVideoRef.current!)

        useEffect(() => {
            if (!isPiPEnabled) {
                setIsPiP(false)
                return
            }

            const observer = new IntersectionObserver(
                ([entry]) => {
                    setIsPiP(!entry.isIntersecting)
                },
                { threshold: 0.1 }
            )

            if (videoContainerRef.current) {
                observer.observe(videoContainerRef.current)
            }

            return () => observer.disconnect()
        }, [isPiPEnabled])

        useEffect(() => {
            setIsVideoLoading(true)
        }, [src])

        const handleMediaLoad = () => {
            setIsVideoLoading(false)
        }

        const handleInternalTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
            const time = e.currentTarget.currentTime
            const sub = subtitles.find((s) => time >= s.start && time <= s.end)
            if (sub?.text !== activeSubtitle) {
                setActiveSubtitle(sub ? sub.text : null)
            }

            if (onTimeUpdate) {
                onTimeUpdate(e)
            }
        }

        return (
            <div ref={videoContainerRef} className={cn('bg-gray-50 pb-4 min-h-[300px]', containerClassName)}>
                <motion.div
                    drag={isPiP && isPiPEnabled}
                    dragMomentum={false}
                    animate={isPiP && isPiPEnabled ? undefined : { x: 0, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    className={cn(
                        'relative w-full aspect-video scale-100 cursor-default',
                        className,
                        isPiP && isPiPEnabled && 'fixed bottom-6 left-6 w-80 z-[100] shadow-2xl scale-100 cursor-move h-auto max-w-[320px]'
                    )}
                >
                    <div className='relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white group'>
                        <video
                            src={src || ''}
                            ref={internalVideoRef}
                            className='w-full h-full object-contain pointer-events-auto'
                            controls
                            onLoadedData={handleMediaLoad}
                            onTimeUpdate={handleInternalTimeUpdate}
                            onSeeking={onSeeking}
                        />

                        {isPiP && isPiPEnabled && (
                            <div className='absolute top-2 right-2 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-pulse pointer-events-none'>
                                Picture in picture (PiP)
                            </div>
                        )}

                        {activeSubtitle && (
                            <div
                                className={`absolute left-0 right-0 flex justify-center px-4 z-10 pointer-events-none transition-all ${isPiP && isPiPEnabled ? 'bottom-10' : 'bottom-16'
                                    }`}
                            >
                                <div
                                    className={`bg-black/60 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-center font-medium shadow-lg animate-in slide-in-from-bottom-2 duration-300 ${isPiP && isPiPEnabled ? 'text-[10px] max-w-[90%]' : 'text-sm md:text-base px-4 py-2'
                                        }`}
                                >
                                    {activeSubtitle}
                                </div>
                            </div>
                        )}

                        {isVideoLoading && (
                            <div className='absolute inset-0 flex items-center justify-center bg-gray-900'>
                                <div className='flex flex-col items-center gap-2'>
                                    <img src={learnovaLogo} alt='Loading' className='w-12 h-12 object-contain animate-bounce' />
                                    <LoadingDots text='Đang tải trình phát...' className='text-blue-400 text-xs' />
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        )
    }
)

export default LearnovaVideoPlayer
