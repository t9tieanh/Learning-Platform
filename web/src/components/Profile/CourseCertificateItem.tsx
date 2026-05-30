import { useState } from 'react'
import { Award, ExternalLink, CalendarDays } from 'lucide-react'
import { CourseCompletionCertificate } from '@/types/course-certificate'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CustomDialog from '@/components/common/Dialog'
import CertificateDetailCard from '@/components/Certificate/CertificateDetailCard'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

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

function CertificateCourseAvatar({ title, thumbnailUrl }: { title: string; thumbnailUrl?: string | null }) {
  return (
    <div className='relative flex-shrink-0'>
      <Avatar className='w-[72px] h-[72px] rounded-2xl ring-1 ring-blue-100'>
        <AvatarImage src={thumbnailUrl ?? undefined} alt={title} className='object-cover' />
        <AvatarFallback className='rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold text-xl'>
          {title.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div
        className='absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center'
        aria-hidden
      >
        <Award className='w-3.5 h-3.5 text-white' />
      </div>
    </div>
  )
}

export default function CourseCertificateItem({ cert }: Props) {
  const [open, setOpen] = useState(false)
  const { courseSnapshot } = cert

  return (
    <>
      <article
        className={cn(
          'group relative overflow-hidden rounded-2xl border border-slate-200/80',
          'bg-gradient-to-br from-white via-white to-blue-50/40',
          'transition-colors hover:border-blue-200 hover:from-blue-50/30 hover:to-indigo-50/30'
        )}
      >
        <div className='absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 to-indigo-500 opacity-80' />

        <div className='flex flex-col sm:flex-row gap-4 p-4 pl-5'>
          <CertificateCourseAvatar title={courseSnapshot.title} thumbnailUrl={courseSnapshot.thumbnailUrl} />

          <div className='flex-1 min-w-0 flex flex-col justify-center gap-1.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200/80'>
                <Award className='w-3 h-3' />
                Đã cấp
              </span>
              <span className='text-[10px] font-mono text-slate-400'>{cert.certificateCode}</span>
            </div>

            <h3 className='font-bold text-base text-slate-900 truncate group-hover:text-blue-700 transition-colors'>
              {courseSnapshot.title}
            </h3>

            <div className='flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-500'>
              <span className='inline-flex items-center gap-1.5 min-w-0'>
                <Avatar className='w-5 h-5 shrink-0'>
                  <AvatarImage src={courseSnapshot.instructorAvatarUrl ?? undefined} alt={courseSnapshot.instructorName} className='object-cover' />
                  <AvatarFallback className='bg-blue-100 text-blue-700 text-[9px] font-bold'>
                    {courseSnapshot.instructorName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className='truncate'>{courseSnapshot.instructorName}</span>
              </span>
              <span className='inline-flex items-center gap-1'>
                <CalendarDays className='w-3.5 h-3.5 text-blue-400' />
                {formatDate(cert.issuedAt)}
              </span>
            </div>
          </div>

          <div className='flex sm:flex-col gap-2 sm:items-end sm:justify-center shrink-0'>
            <Button
              size='sm'
              className='rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold h-9 px-4'
              onClick={() => setOpen(true)}
            >
              Xem chứng chỉ
            </Button>
            <Link
              to={`/certificate/verify/${cert.certificateCode}`}
              className='inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 h-9 px-3 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors'
            >
              <ExternalLink className='w-3.5 h-3.5' />
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
        size='xl'
        className='w-[95vw] max-w-3xl p-0 overflow-hidden bg-white border border-slate-200 rounded-2xl gap-0'
        contentClassName='my-0 w-full'
      >
        <div className='p-4 sm:p-6 max-h-[90vh] overflow-y-auto'>
          <div className='flex items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100'>
            <div>
              <h2 className='text-lg font-bold text-slate-900'>Chứng chỉ của bạn</h2>
              <p className='text-xs text-slate-500 mt-0.5'>Xem trước chứng chỉ hoàn thành khóa học</p>
            </div>
            <Link
              to={`/certificate/verify/${cert.certificateCode}`}
              onClick={() => setOpen(false)}
              className='inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-2 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition-colors shrink-0'
            >
              <ExternalLink className='w-3.5 h-3.5' />
              Link tra cứu
            </Link>
          </div>

          <CertificateDetailCard
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

          <div className='flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-5 pt-4 border-t border-slate-100'>
            <Button variant='outline' className='rounded-xl border-slate-200' onClick={() => setOpen(false)}>
              Đóng
            </Button>
            <Button asChild className='rounded-xl bg-blue-600 hover:bg-blue-700'>
              <Link to={`/certificate/verify/${cert.certificateCode}`} onClick={() => setOpen(false)}>
                Mở trang tra cứu công khai
              </Link>
            </Button>
          </div>
        </div>
      </CustomDialog>
    </>
  )
}
