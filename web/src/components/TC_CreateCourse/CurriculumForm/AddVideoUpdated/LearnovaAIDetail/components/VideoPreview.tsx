import React from 'react'
import LearnovaVideoPlayer, { SubtitleEntry } from '@/components/common/Video/LearnovaVideoPlayer'

interface VideoPreviewProps {
    videoSrc: string | null
    detailedVideoRef: React.RefObject<HTMLVideoElement | null>
    subtitles: SubtitleEntry[]
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoSrc, detailedVideoRef, subtitles }) => {
    return (
        <div className='relative pointer-events-auto'>
            <div className='overflow-hidden rounded-2xl border border-gray-100 shadow-sm'>
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
