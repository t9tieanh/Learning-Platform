import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import courseCertificateService from '@/services/certificate/course-certificate.service'
import { CourseCompletionCertificate } from '@/types/course-certificate'
import CourseCertificateItem from './CourseCertificateItem'
import CourseCertificateListSkeleton from './CourseCertificateListSkeleton'
import Banner from './banner'

export default function CourseCertificateList() {
  const [certificates, setCertificates] = useState<CourseCompletionCertificate[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        setLoading(true)
        const res = await courseCertificateService.getMyCertificates()
        if (res.code === 200 && res.result) {
          setCertificates(res.result)
        }
      } catch (e) {
        console.error('Failed to load certificates', e)
      } finally {
        setLoading(false)
      }
    }
    fetchCerts()
  }, [])

  return (
    <div className='bg-white shadow-lg border-1 border-gray-200 rounded-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        <Banner name='Chứng chỉ của tôi' description='Danh sách chứng chỉ bạn đã nhận sau khi hoàn thành khóa học.' />
        <div className='certificate-list'>
          {loading ? (
            <CourseCertificateListSkeleton />
          ) : certificates.length === 0 ? (
            <div className='text-center py-12 text-muted-foreground'>
              <Award className='w-12 h-12 mx-auto mb-3 opacity-30' />
              <p className='font-medium'>Chưa có chứng chỉ nào</p>
              <p className='text-sm mt-1'>Hoàn thành 100% bài học trong khóa để nhận chứng chỉ.</p>
            </div>
          ) : (
            <div className='space-y-3'>
              {certificates.map((cert) => (
                <CourseCertificateItem key={cert.id} cert={cert} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
