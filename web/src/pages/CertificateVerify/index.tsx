import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Award, Home, Loader2, SearchX, ShieldAlert } from 'lucide-react'
import courseCertificateService from '@/services/certificate/course-certificate.service'
import { CertificateVerifyResult } from '@/types/course-certificate'
import { Button } from '@/components/ui/button'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import CertificateDetailCard, { CertificateValidBadge } from '@/components/Certificate/CertificateDetailCard'

export default function CertificateVerifyPage() {
  const { code } = useParams<{ code: string }>()
  const [result, setResult] = useState<CertificateVerifyResult | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const verify = async () => {
      if (!code) return
      try {
        setLoading(true)
        setError(false)
        const res = await courseCertificateService.verifyCertificate(code)
        if (res.code === 200 && res.result) {
          setResult(res.result)
        } else {
          setError(true)
        }
      } catch {
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    verify()
  }, [code])

  return (
    <div className='min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50/30 px-4 py-10 sm:py-14'>
      <div className='max-w-3xl mx-auto'>
        <div className='overflow-hidden rounded-3xl border border-slate-200/80 bg-white'>
          <HighGlossBackground className='px-6 py-5 sm:px-8'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center'>
                <Award className='w-5 h-5 text-white' />
              </div>
              <div>
                <h1 className='text-lg sm:text-xl font-black text-white tracking-tight'>Tra cứu chứng chỉ</h1>
                <p className='text-xs text-blue-100/80 font-medium mt-0.5'>
                  Xác minh tính hợp lệ của chứng chỉ Learnova
                </p>
              </div>
            </div>
          </HighGlossBackground>

          <div className='p-5 sm:p-8'>
            {code && (
              <div className='mb-6 flex items-center justify-center'>
                <span className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 bg-slate-50 text-xs font-mono text-slate-600'>
                  Mã tra cứu: <strong className='text-slate-800'>{code}</strong>
                </span>
              </div>
            )}

            {loading ? (
              <div className='flex flex-col items-center justify-center py-16 gap-4'>
                <Loader2 className='w-10 h-10 text-blue-600 animate-spin' />
                <p className='text-sm font-medium text-slate-500'>Đang xác minh chứng chỉ...</p>
              </div>
            ) : error || !result ? (
              <div className='flex flex-col items-center text-center py-10 sm:py-14 px-4'>
                <div className='w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mb-5'>
                  <SearchX className='w-8 h-8 text-red-400' />
                </div>
                <h2 className='text-xl font-bold text-slate-900 mb-2'>Không tìm thấy chứng chỉ</h2>
                <p className='text-sm text-slate-500 max-w-md leading-relaxed'>
                  Mã chứng chỉ không hợp lệ, chưa được cấp hoặc đã bị thu hồi. Vui lòng kiểm tra lại mã và thử lại.
                </p>
                <div className='mt-6 flex flex-wrap gap-3 justify-center'>
                  <Button asChild variant='outline' className='rounded-xl border-slate-200'>
                    <Link to='/'>
                      <Home className='w-4 h-4 mr-2' />
                      Về trang chủ
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className='space-y-6'>
                <div className='flex justify-center'>
                  <CertificateValidBadge />
                </div>

                <CertificateDetailCard
                  showHeader={false}
                  data={{
                    certificateCode: result.certificateCode,
                    issuedAt: result.issuedAt,
                    recipientName: result.recipientSnapshot.name,
                    courseTitle: result.courseSnapshot.title,
                    courseThumbnailUrl: result.courseSnapshot.thumbnailUrl,
                    instructorName: result.courseSnapshot.instructorName,
                    instructorAvatarUrl: result.courseSnapshot.instructorAvatarUrl
                  }}
                />

                <div className='flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3'>
                  <ShieldAlert className='w-4 h-4 text-blue-600 mt-0.5 shrink-0' />
                  <p className='text-xs text-slate-600 leading-relaxed'>
                    Thông tin trên được lưu tại thời điểm cấp chứng chỉ và có thể khác với dữ liệu hiện tại của khóa học.
                  </p>
                </div>

                <div className='flex justify-center pt-2'>
                  <Button asChild variant='outline' className='rounded-xl border-slate-200 h-10 px-5'>
                    <Link to='/'>
                      <Home className='w-4 h-4 mr-2' />
                      Về trang chủ
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
