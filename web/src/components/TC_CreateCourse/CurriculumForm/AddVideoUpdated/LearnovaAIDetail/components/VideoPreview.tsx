import React from 'react'
import LearnovaVideoPlayer, { SubtitleEntry } from '@/components/common/Video/LearnovaVideoPlayer'

interface VideoPreviewProps {
    videoSrc: string | null
    detailedVideoRef: React.RefObject<HTMLVideoElement | null>
    subtitles: SubtitleEntry[]
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoSrc, detailedVideoRef, subtitles }) => {
    return (
        <div className='relative group'>
            <div className='absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200'></div>
            <div className='relative overflow-hidden rounded-[2rem] border-8 border-white shadow-md'>
                <LearnovaVideoPlayer
                    src={videoSrc || ''}
                    ref={detailedVideoRef}
                    subtitles={subtitles}
                    isPiPEnabled={true}
                    containerClassName='pb-0'
                />
            </div>
        </div>
    )
}

export default VideoPreview
