/* eslint-disable jsx-a11y/media-has-caption */
import { Play } from 'lucide-react'
import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import VideoPlayer from './VideoPlayer'

export const LessonViewer = ({ lesson }: { lesson: Lesson }) => {
  const { id } = lesson
  const backEndUri = import.meta.env.VITE_BACKEND_URI as string
  const { data } = useAuthStore()

  if (!id) {
    return (
      <div className='w-full aspect-video flex items-center justify-center bg-gradient-to-br from-muted/30 to-background rounded-lg'>
        <div className='text-muted-foreground text-sm'>File không có sẵn</div>
      </div>
    )
  }

  return (
    <div className='w-full px-3 aspect-video bg-video-bg rounded-lg overflow-hidden relative group'>
      {lesson.type === 'video' ? (
        <VideoPlayer lesson={lesson} />
      ) : lesson.type === 'article' ? (
        <iframe
          src={`${backEndUri}learning/lesson-student/${lesson.id}?token=${data?.accessToken}`}
          title={lesson.title}
          className='w-full h-full rounded-lg border-none'
        />
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
