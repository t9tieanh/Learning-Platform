import { Lesson } from '@/types/course-student'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useEffect, useState } from 'react'
import logo from '@/assets/images/logo1.png'
import { LoadingDots } from '@/components/common/Loading/LoadingDots'
import lessonStudentService from '@/services/course/lesson-student.service'
import { toast } from 'react-toastify'

const PDFViewer = ({ lesson, markDoneVideo }: { lesson: Lesson; markDoneVideo: () => Promise<void> }) => {
  const { data } = useAuthStore()
  const [isLoading, setIsLoading] = useState(true)
  const [pdfSrc, setPdfSrc] = useState<string>('')

  useEffect(() => {
    markDoneVideo()
  }, [markDoneVideo, lesson])

  useEffect(() => {
    const fetchPdfData = async () => {
      if (lesson.id && data?.accessToken) {
        setIsLoading(true)
        try {
          const currentHost = window.location.hostname
          const response = await lessonStudentService.getPresignedCookies(lesson.id)

          if (response.code === 200 && response.result) {
            const { policy, signature, keyPairId, expires, domain, url } = response.result

            const canUseCookies = !domain.endsWith('.cloudfront.net') &&
              (currentHost.endsWith(domain.split('.').slice(-2).join('.')) || currentHost === 'localhost')

            if (canUseCookies && currentHost !== 'localhost') {
              const cookieSettings = `; domain=.${domain}; path=/; Secure; SameSite=None`
              if (policy) document.cookie = `CloudFront-Policy=${policy}${cookieSettings}`
              if (expires) document.cookie = `CloudFront-Expires=${expires}${cookieSettings}`
              document.cookie = `CloudFront-Signature=${signature}${cookieSettings}`
              document.cookie = `CloudFront-Key-Pair-Id=${keyPairId}${cookieSettings}`
              setPdfSrc(url)
            } else {
              const urlResponse = await lessonStudentService.getPresignedUrl(lesson.id)
              if (urlResponse.code === 200) {
                setPdfSrc(urlResponse.result || '')
              }
            }
          }
        } catch (error) {
          console.error('PDF access error:', error)
          toast.error('Không thể xác thực quyền truy cập tài liệu.')
        }
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
