import { Play, AlertTriangle } from 'lucide-react'
import { Lesson } from '@/types/course-student'
import ModernVideoPlayer from './ModernVideoPlayer'
import { VideoPlayerRef } from './VideoPlayer'
import PDFViewer from './PDFViewer'
import { useCallback, forwardRef, useRef } from 'react'
import lessonStudentService from '@/services/course/lesson-student.service'
import { toast } from 'sonner'

import { LessonChunk } from '@/types/ai'

export const LessonViewer = forwardRef<VideoPlayerRef, {
  lesson: Lesson;
  courseTitle?: string;
  subtitlesRaw?: string | null;
  chunks?: LessonChunk[];
  isInvalid?: boolean;
  qualityReason?: string | null;
  onShowChunkDetails?: (chunkId: string) => void;
  onProgress?: (percent: number) => void;
  onLessonCompleted?: () => void;
  onCourseCompleted?: (certificate?: { id: string; certificateCode: string }) => void;
}>(
  ({ lesson, courseTitle, subtitlesRaw, chunks = [], isInvalid, qualityReason, onShowChunkDetails, onProgress, onLessonCompleted, onCourseCompleted }, ref) => {
    const { id } = lesson
    const onLessonCompletedRef = useRef(onLessonCompleted)
    onLessonCompletedRef.current = onLessonCompleted
    const onCourseCompletedRef = useRef(onCourseCompleted)
    onCourseCompletedRef.current = onCourseCompleted

    const markDoneLesson = useCallback(async () => {
      if (lesson.completionStatus === 'COMPLETED') return
      try {
        const response = await lessonStudentService.markDone(lesson.id)
        if (response?.code === 200) {
          toast.success(response.message)
          onLessonCompletedRef.current?.()
          if (response.result?.isCompletedCourse) {
            const { certificateId, certificateCode } = response.result
            if (certificateId && certificateCode) {
              onCourseCompletedRef.current?.({ id: certificateId, certificateCode })
            } else {
              onCourseCompletedRef.current?.()
            }
          }
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

    if (isInvalid) {
      return (
        <div className='w-full aspect-video bg-slate-900 rounded-[2rem] flex flex-col items-center justify-center p-8 text-center shadow-2xl border border-red-500/20'>
          <div className='w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mb-6 animate-pulse'>
            <AlertTriangle className='w-10 h-10 text-red-500' />
          </div>
          <h3 className='text-2xl font-bold text-white mb-2'>Nội dung không đạt yêu cầu</h3>
          <p className='text-slate-400 max-w-md'>
            {qualityReason || 'Rất tiếc, bài học này hiện không đáp ứng đủ tiêu chuẩn chất lượng AI để xử lý nội dung. Vui lòng liên hệ quản trị viên.'}
          </p>
        </div>
      )
    }

    return (
      <div className='w-full aspect-video bg-black rounded-[2rem] overflow-hidden relative group shadow-2xl'>
        {lesson.type === 'video' ? (
          <ModernVideoPlayer ref={ref} lesson={lesson} courseTitle={courseTitle} markDoneVideo={markDoneLesson} subtitlesRaw={subtitlesRaw || undefined} chunks={chunks} onShowChunkDetails={onShowChunkDetails} onProgress={onProgress} />
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
