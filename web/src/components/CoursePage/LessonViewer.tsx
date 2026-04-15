import { Play } from 'lucide-react'
import { Lesson } from '@/types/course-student'
import VideoPlayer, { VideoPlayerRef } from './VideoPlayer'
import PDFViewer from './PDFViewer'
import { useCallback, forwardRef } from 'react'
import lessonStudentService from '@/services/course/lesson-student.service'
import { toast } from 'sonner'

import { LessonChunk } from '@/types/ai'

export const LessonViewer = forwardRef<VideoPlayerRef, {
  lesson: Lesson;
  subtitlesRaw?: string | null;
  chunks?: LessonChunk[];
  onShowChunkDetails?: (chunkId: string) => void;
}>(
  ({ lesson, subtitlesRaw, chunks = [], onShowChunkDetails }, ref) => {
    const { id } = lesson

    const markDoneLesson = useCallback(async () => {
      if (lesson.completionStatus === 'COMPLETED') return
      try {
        const response = await lessonStudentService.markDone(lesson.id)
        if (response?.code === 200) {
          toast.success(response.message)
        }
      } catch (error) {
        console.error('Failed to mark lesson as completed', error)
      }
    }, [lesson.id, lesson.completionStatus])

    if (!id) {
      return (
        <div className='w-full aspect-video flex items-center justify-center bg-gradient-to-br from-muted/30 to-background rounded-lg'>
          <div className='text-muted-foreground text-sm'>File không có sẵn</div>
        </div>
      )
    }

    return (
      <div className='w-full aspect-video bg-black rounded-[2rem] overflow-hidden relative group shadow-2xl'>
        {lesson.type === 'video' ? (
          <VideoPlayer ref={ref} lesson={lesson} markDoneVideo={markDoneLesson} subtitlesRaw={subtitlesRaw || undefined} chunks={chunks} />
        ) : lesson.type === 'article' ? (
          <PDFViewer lesson={lesson} markDoneVideo={markDoneLesson} />
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
)
