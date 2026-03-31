import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import learnovaLogo from '@/assets/images/logo1.png'

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
}

const LearnovaVideoPlayer = forwardRef<HTMLVideoElement | null, LearnovaVideoPlayerProps>(
    ({ src, subtitles = [], isPiPEnabled = false, className = '', containerClassName = '' }, ref) => {
        const [isVideoLoading, setIsVideoLoading] = useState(true)
        const [activeSubtitle, setActiveSubtitle] = useState<string | null>(null)
        const [isPiP, setIsPiP] = useState(false)
        const videoContainerRef = useRef<HTMLDivElement>(null)
        const internalVideoRef = useRef<HTMLVideoElement>(null)

        // Expose the video ref to the parent
        useImperativeHandle(ref, () => internalVideoRef.current!)

        // Intersection Observer for PiP
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

        // Video Loading
        useEffect(() => {
            setIsVideoLoading(true)
        }, [src])

        const handleMediaLoad = () => {
            setIsVideoLoading(false)
        }

        // Subtitles Logic
        const handleTimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
            const time = e.currentTarget.currentTime
            const sub = subtitles.find((s) => time >= s.start && time <= s.end)
            if (sub?.text !== activeSubtitle) {
                setActiveSubtitle(sub ? sub.text : null)
            }
        }

        return (
            <div ref={videoContainerRef} className={`bg-gray-50 pb-4 min-h-[300px] ${containerClassName}`}>
                <div
                    className={`transition-all duration-500 ease-in-out ${isPiP && isPiPEnabled
                        ? 'fixed bottom-6 right-6 w-80 z-[100] shadow-2xl scale-100'
                        : 'relative w-full aspect-video scale-100'
                        } ${className}`}
                >
                    <div className='relative w-full h-full bg-black rounded-2xl overflow-hidden shadow-2xl border-4 border-white group'>
                        <video
                            src={src || ''}
                            ref={internalVideoRef}
                            className='w-full h-full object-contain'
                            controls
                            onLoadedData={handleMediaLoad}
                            onTimeUpdate={handleTimeUpdate}
                        />

                        {/* PiP Label */}
                        {isPiP && isPiPEnabled && (
                            <div className='absolute top-2 left-2 bg-blue-600/80 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-pulse'>
                                Đang xem chế độ thu nhỏ
                            </div>
                        )}

                        {/* Manual Subtitles Overlay */}
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
                </div>
            </div>
        )
    }
)

LearnovaVideoPlayer.displayName = 'LearnovaVideoPlayer'

export default LearnovaVideoPlayer
