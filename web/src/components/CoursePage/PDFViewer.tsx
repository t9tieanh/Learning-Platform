import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useEffect, useRef, useState } from 'react'
import logo from '@/assets/images/logo1.png'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import lessonStudentService from '@/services/course/lesson-student.service'
import { toast } from 'react-toastify'

const PDFViewer = ({ lesson, markDoneVideo }: { lesson: Lesson; markDoneVideo: () => Promise<void> }) => {
  const { data } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [pdfSrc, setPdfSrc] = useState<string>('')

  const markDoneVideoRef = useRef(markDoneVideo)
  markDoneVideoRef.current = markDoneVideo
  const markDoneRequestedForLessonRef = useRef<string | null>(null)
  const presignedRequestedForLessonRef = useRef<string | null>(null)

  useEffect(() => {
    if (lesson.completionStatus === 'COMPLETED') return
    if (markDoneRequestedForLessonRef.current === lesson.id) return
    markDoneRequestedForLessonRef.current = lesson.id
    void markDoneVideoRef.current()
  }, [lesson.id, lesson.completionStatus])

  useEffect(() => {
    const fetchPdfData = async () => {
      if (!lesson.id || !data?.accessToken) return
      if (presignedRequestedForLessonRef.current === lesson.id) return
      presignedRequestedForLessonRef.current = lesson.id

      setIsLoading(true)
      try {
        const urlResponse = await lessonStudentService.getLessonVideoUrl(lesson.id)
        if (urlResponse.code === 200) {
          setPdfSrc(urlResponse.result || '')
        }
      } catch (error) {
        console.error('PDF access error:', error)
        toast.error('Không thể xác thực quyền truy cập tài liệu.')
        presignedRequestedForLessonRef.current = null
      }
    }

    fetchPdfData()
  }, [lesson.id, data?.accessToken])

  if (!pdfSrc && !isLoading) return null

  return (
    <div className='relative w-full h-full'>
      {pdfSrc && (
        <iframe
          src={pdfSrc}
          title={lesson.title}
          className='w-full h-full rounded-lg border-none'
          onLoad={() => setIsLoading(false)}
        />
      )}
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
