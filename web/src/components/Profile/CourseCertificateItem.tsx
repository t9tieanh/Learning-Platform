import { useMemo, useState } from 'react'
import { Award, CalendarDays, Copy, Download, ExternalLink, X } from 'lucide-react'
import { CourseCompletionCertificate } from '@/types/course-certificate'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import CustomButton from '@/components/common/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CustomDialog from '@/components/common/Dialog'
import CertificateDetailCard from '@/components/Certificate/CertificateDetailCard'
import courseCertificateService from '@/services/certificate/course-certificate.service'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

interface Props {
  cert: CourseCompletionCertificate
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

export default function CourseCertificateItem({ cert }: Props) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const { courseSnapshot } = cert

  const publicVerifyUrl = useMemo(
    () => `${window.location.origin}/certificate/verify/${cert.certificateCode}`,
    [cert.certificateCode]
  )

  const handleCopyPublicLink = async () => {
    try {
      await navigator.clipboard.writeText(publicVerifyUrl)
      toast.success('Đã sao chép link công khai')
    } catch (error) {
      console.error('Failed to copy certificate link', error)
      toast.error('Không thể sao chép link. Vui lòng thử lại.')
    }
  }

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true)
      await courseCertificateService.downloadCertificatePdf(
        cert.id,
        `Learnova-Chung-chi-${cert.certificateCode}.pdf`
      )
      toast.success('Đã tải chứng chỉ PDF')
    } catch (error) {
      console.error('Failed to download certificate PDF', error)
      toast.error('Không thể tải file PDF. Vui lòng thử lại.')
    } finally {
      setDownloading(false)
    }
  }

  return (
    <>
      <article className='group rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]'>
        <div className='flex flex-col gap-4 sm:flex-row'>
          <Avatar className='h-16 w-16 shrink-0 rounded-xl ring-1 ring-slate-200'>
            <AvatarImage src={courseSnapshot.thumbnailUrl ?? undefined} alt={courseSnapshot.title} className='object-cover' />
            <AvatarFallback className='rounded-xl bg-blue-100 text-lg font-semibold text-blue-700'>
              {courseSnapshot.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className='flex min-w-0 flex-1 flex-col justify-center gap-1.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700'>Đã cấp</span>
              <span className='font-mono text-xs text-slate-400'>{cert.certificateCode}</span>
            </div>

            <h3 className='truncate text-base font-semibold text-slate-900'>{courseSnapshot.title}</h3>

            <div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500'>
              <span className='inline-flex min-w-0 items-center gap-1.5'>
                <Avatar className='h-5 w-5 shrink-0'>
                  <AvatarImage
                    src={courseSnapshot.instructorAvatarUrl ?? undefined}
                    alt={courseSnapshot.instructorName}
                    className='object-cover'
                  />
                  <AvatarFallback className='bg-slate-100 text-[9px] font-semibold text-slate-600'>
                    {courseSnapshot.instructorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className='truncate'>{courseSnapshot.instructorName}</span>
              </span>
              <span className='inline-flex items-center gap-1'>
                <CalendarDays className='h-3.5 w-3.5 text-slate-400' />
                {formatDate(cert.issuedAt)}
              </span>
            </div>
          </div>

          <div className='flex shrink-0 gap-2 sm:flex-col sm:items-end sm:justify-center'>
            <Button
              size='sm'
              className='h-9 rounded-xl bg-blue-600 px-4 font-semibold text-white hover:bg-blue-700'
              onClick={() => setOpen(true)}
            >
              Xem chứng chỉ
            </Button>
            <Link
              to={`/certificate/verify/${cert.certificateCode}`}
              className='inline-flex h-9 items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900'
            >
              <ExternalLink className='h-3.5 w-3.5' />
              Tra cứu
            </Link>
          </div>
        </div>
      </article>

      <CustomDialog
        open={open}
        setOpen={setOpen}
        title='Chứng chỉ hoàn thành khóa học'
        hideHeader
        noPadding
        showCloseButton={false}
        size='xl'
        className='w-[95vw] max-w-3xl gap-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-0'
        contentClassName='my-0 w-full'
      >
        <div className='p-4 sm:p-5'>
          <div className='mb-4 flex items-start justify-between gap-3 border-b border-slate-100 pb-3'>
            <div className='flex items-start gap-3'>
              <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600'>
                <Award className='h-5 w-5' />
              </div>
              <div>
                <h2 className='text-base font-semibold text-slate-900'>Chứng chỉ của bạn</h2>
                <p className='mt-0.5 text-xs text-slate-500'>Xem trước chứng chỉ hoàn thành khóa học</p>
              </div>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              className='rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600'
              aria-label='Đóng'
            >
              <X className='h-4 w-4' />
            </button>
          </div>

          <div className='mx-auto w-full max-w-[720px]'>
            <CertificateDetailCard
              compact
              data={{
                certificateCode: cert.certificateCode,
                issuedAt: cert.issuedAt,
                recipientName: cert.recipientSnapshot.name,
                courseTitle: courseSnapshot.title,
                courseThumbnailUrl: courseSnapshot.thumbnailUrl,
                instructorName: courseSnapshot.instructorName,
                instructorAvatarUrl: courseSnapshot.instructorAvatarUrl
              }}
            />

            <div className='mt-4'>
              <p className='mb-1.5 text-xs font-medium text-slate-500'>Link tra cứu công khai</p>
              <div className='flex w-full min-w-0 items-center gap-2'>
                <Input
                  readOnly
                  value={publicVerifyUrl}
                  className='h-9 min-w-0 flex-1 rounded-xl border-slate-200 bg-slate-50 px-3 font-mono text-xs text-slate-700'
                  onFocus={(e) => e.target.select()}
                />
                <CustomButton
                  variant='outline'
                  label='Sao chép'
                  icon={<Copy className='h-4 w-4' />}
                  className='h-9 shrink-0 rounded-xl border-slate-200 px-3 font-medium text-slate-700 hover:bg-slate-50'
                  onClick={handleCopyPublicLink}
                />
              </div>
            </div>

            <div className='mt-4 flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end'>
              <CustomButton
                variant='outline'
                label='Tải PDF'
                icon={<Download className='h-4 w-4' />}
                isLoader={downloading}
                disabled={downloading}
                className='h-9 rounded-xl border-slate-200 px-4 font-medium text-slate-700 hover:bg-slate-50'
                onClick={handleDownloadPdf}
              />
              <CustomButton
                label='Tra cứu công khai'
                icon={<ExternalLink className='h-4 w-4' />}
                className='h-9 rounded-xl bg-blue-600 px-4 font-medium text-white hover:bg-blue-700'
                onClick={() => {
                  setOpen(false)
                  navigate(`/certificate/verify/${cert.certificateCode}`)
                }}
              />
            </div>
          </div>
        </div>
      </CustomDialog>
    </>
  )
}
