import { useEffect, useState } from 'react'
import { Award } from 'lucide-react'
import courseCertificateService from '@/services/certificate/course-certificate.service'
import { CourseCompletionCertificate } from '@/types/course-certificate'
import CourseCertificateItem from './CourseCertificateItem'
import CourseCertificateListSkeleton from './CourseCertificateListSkeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

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
    <Card className='border border-slate-200/80 bg-white'>
      <CardHeader className='border-b border-slate-100'>
        <CardTitle className='flex items-center gap-2 text-xl text-slate-900'>
          <div className='w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center'>
            <Award className='w-5 h-5 text-blue-600' />
          </div>
          Chứng chỉ khóa học
        </CardTitle>
      </CardHeader>
      <CardContent className='pt-5'>
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
      </CardContent>
    </Card>
  )
}
