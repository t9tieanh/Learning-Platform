/* eslint-disable jsx-a11y/media-has-caption */
import { Play } from 'lucide-react'

interface LessonViewerProps {
  url?: string
  title: string
  type?: 'video' | 'pdf'
}

export const LessonViewer = ({ url, title, type = 'video' }: LessonViewerProps) => {
  if (!url) {
    return (
      <div className='w-full aspect-video flex items-center justify-center bg-gradient-to-br from-muted/30 to-background rounded-lg'>
        <div className='text-muted-foreground text-sm'>No content available</div>
      </div>
    )
  }

  return (
    <div className='w-full aspect-video bg-video-bg rounded-lg overflow-hidden relative group'>
      {type === 'video' ? (
        <video src={url} controls className='w-full h-full' title={title} />
      ) : type === 'pdf' ? (
        <iframe src={url} title={title} className='w-full h-full rounded-lg border-none' />
      ) : (
        <div className='w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/30 to-background'>
          <button className='w-24 h-24 rounded-full bg-primary/20 hover:bg-primary/30 transition-all duration-300 flex items-center justify-center group-hover:scale-110 backdrop-blur-sm border border-primary/20'>
            <Play className='w-12 h-12 text-primary fill-primary ml-1' />
          </button>
        </div>
      )}
    </div>
  )
}
