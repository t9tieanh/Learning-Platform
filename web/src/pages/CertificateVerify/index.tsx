import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Download, Home, Loader2, SearchX } from 'lucide-react'
import courseCertificateService from '@/services/certificate/course-certificate.service'
import { CertificateVerifyResult } from '@/types/course-certificate'
import { Button } from '@/components/ui/button'
import CertificateDetailCard, { CertificateValidBadge } from '@/components/Certificate/CertificateDetailCard'
import CertificateVerifySkeleton from '@/components/Certificate/CertificateVerifySkeleton'
import { useAuthStore } from '@/stores/useAuth.stores'
import { toast } from 'sonner'

export default function CertificateVerifyPage() {
  const { code } = useParams<{ code: string }>()
  const currentUserId = useAuthStore((state) => state.data?.userId)
  const [result, setResult] = useState<CertificateVerifyResult | null>(null)
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(true)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const isCertificateOwner = useMemo(
    () => Boolean(currentUserId && result?.recipientSnapshot.userId === currentUserId),
    [currentUserId, result?.recipientSnapshot.userId]
  )

  const handleDownloadPdf = async () => {
    if (!code) return
    try {
      setDownloadingPdf(true)
      await courseCertificateService.downloadCertificatePdfByCode(code)
      toast.success('Đã tải chứng chỉ PDF')
    } catch (err) {
      console.error('Failed to download certificate PDF', err)
      toast.error('Không thể tải file PDF. Vui lòng thử lại.')
    } finally {
      setDownloadingPdf(false)
    }
  }

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
    <div className='min-h-screen bg-[#f4f9fc] px-4 py-10 sm:py-14'>
      <div className='mx-auto max-w-2xl'>
        <div className='mb-6'>
          <h1 className='text-2xl font-bold text-slate-900'>Tra cứu chứng chỉ</h1>
          <p className='mt-1 text-sm text-slate-500'>Xác minh tính hợp lệ của chứng chỉ Learnova</p>
        </div>

        <div className='rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] sm:p-6'>
          {loading ? (
            <CertificateVerifySkeleton />
          ) : error || !result ? (
            <div className='flex flex-col items-center px-4 py-10 text-center sm:py-14'>
              <div className='mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50'>
                <SearchX className='h-7 w-7 text-red-400' />
              </div>
              <h2 className='mb-2 text-lg font-semibold text-slate-900'>Không tìm thấy chứng chỉ</h2>
              <p className='max-w-md text-sm leading-relaxed text-slate-500'>
                Mã chứng chỉ không hợp lệ, chưa được cấp hoặc đã bị thu hồi. Vui lòng kiểm tra lại mã và thử lại.
              </p>
              <Button asChild variant='outline' className='mt-6 h-10 rounded-xl border-slate-200 px-5'>
                <Link to='/'>
                  <Home className='mr-2 h-4 w-4' />
                  Về trang chủ
                </Link>
              </Button>
            </div>
          ) : (
            <div className='space-y-5'>
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

              <p className='text-center text-xs leading-relaxed text-slate-500'>
                Thông tin được lưu tại thời điểm cấp chứng chỉ và có thể khác với dữ liệu hiện tại của khóa học.
              </p>

              <div className='flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-4'>
                {isCertificateOwner && (
                  <Button
                    className='h-10 rounded-xl bg-blue-600 px-5 hover:bg-blue-700'
                    onClick={handleDownloadPdf}
                    disabled={downloadingPdf}
                  >
                    {downloadingPdf ? (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    ) : (
                      <Download className='mr-2 h-4 w-4' />
                    )}
                    Tải PDF
                  </Button>
                )}
                <Button asChild variant='outline' className='h-10 rounded-xl border-slate-200 px-5'>
                  <Link to='/'>
                    <Home className='mr-2 h-4 w-4' />
                    Về trang chủ
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
