import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useEffect } from 'react'

const PDFViewer = ({ lesson, markDoneVideo }: { lesson: Lesson; markDoneVideo: () => Promise<void> }) => {
  const backEndUri = import.meta.env.VITE_BACKEND_URI as string
  const { data } = useAuthStore()

  useEffect(() => {
    markDoneVideo()
  }, [markDoneVideo, lesson])

  return (
    <>
      <iframe
        src={`${backEndUri}learning/lesson-student/${lesson.id}?token=${data?.accessToken}`}
        title={lesson.title}
        className='w-full h-full rounded-lg border-none'
      />
    </>
  )
}
export default PDFViewer
