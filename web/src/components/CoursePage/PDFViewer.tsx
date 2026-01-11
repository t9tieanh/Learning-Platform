import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useEffect, useState } from 'react'
import logo from '@/assets/images/logo1.png'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'

const PDFViewer = ({ lesson, markDoneVideo }: { lesson: Lesson; markDoneVideo: () => Promise<void> }) => {
  const backEndUri = import.meta.env.VITE_BACKEND_URI as string
  const { data } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    markDoneVideo()
  }, [markDoneVideo, lesson])

  return (
    <div className='relative w-full h-full'>
      <iframe
        src={`${backEndUri}learning/lesson-student/${lesson.id}?token=${data?.accessToken}`}
        title={lesson.title}
        className='w-full h-full rounded-lg border-none'
        onLoad={() => setIsLoading(false)}
      />
      {isLoading && (
        <div className='absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg'>
          <div className='flex flex-col items-center gap-4'>
            <div className='relative w-16 h-16'>
              <img src={logo} alt='Loading' className='w-full h-full object-contain animate-bounce' />
            </div>
            <LoadingDots text='Learnova đang tải tài liệu' className='text-white text-sm font-medium' />
          </div>
        </div>
      )}
    </div>
  )
}
export default PDFViewer
