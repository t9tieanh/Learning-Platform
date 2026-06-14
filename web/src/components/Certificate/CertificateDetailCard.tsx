import { ShieldCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export interface CertificateDetailData {
  certificateCode: string
  issuedAt: string
  recipientName: string
  courseTitle: string
  courseThumbnailUrl?: string | null
  instructorName: string
  instructorAvatarUrl?: string | null
}

export function formatCertificateDate(iso: string) {
  return new Date(iso).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })
}

interface CertificateDetailCardProps {
  data: CertificateDetailData
  className?: string
  showHeader?: boolean
  compact?: boolean
}

export default function CertificateDetailCard({
  data,
  className,
  showHeader = true,
  compact = false
}: CertificateDetailCardProps) {
  const {
    certificateCode,
    issuedAt,
    recipientName,
    courseTitle,
    courseThumbnailUrl,
    instructorName,
    instructorAvatarUrl
  } = data

  return (
    <div
      className={cn(
        'w-full max-w-[720px] mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]',
        className
      )}
    >
      {showHeader && (
        <div
          className={cn(
            'flex items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/80',
            compact ? 'px-4 py-3' : 'px-6 py-4'
          )}
        >
          <div>
            <p className='text-sm font-semibold text-slate-900'>Chứng nhận hoàn thành khóa học</p>
            <p className='mt-0.5 text-xs text-slate-500'>Learnova</p>
          </div>
          <span className='hidden shrink-0 font-mono text-xs text-slate-400 sm:inline'>{certificateCode}</span>
        </div>
      )}

      <div
        className={cn(
          'relative overflow-hidden bg-blue-100',
          compact ? 'h-28 sm:h-32' : 'h-32 sm:h-40'
        )}
      >
        {courseThumbnailUrl ? (
          <img src={courseThumbnailUrl} alt={courseTitle} className='h-full w-full object-cover' />
        ) : (
          <div className='flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-100 to-slate-100'>
            <span className={cn('font-bold text-blue-300', compact ? 'text-4xl' : 'text-5xl')}>
              {courseTitle.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-black/15 to-transparent' />
      </div>

      <div className={cn(compact ? 'px-4 py-5 sm:px-6' : 'px-6 py-6 sm:px-8 sm:py-7')}>
        <div className='flex gap-4 sm:gap-5'>
          <Avatar
            className={cn(
              'shrink-0 rounded-xl ring-2 ring-white shadow-sm',
              compact ? 'h-16 w-16' : 'h-20 w-20 sm:h-24 sm:w-24'
            )}
          >
            <AvatarImage src={courseThumbnailUrl ?? undefined} alt={courseTitle} className='object-cover' />
            <AvatarFallback className='rounded-xl bg-blue-100 text-lg font-semibold text-blue-700'>
              {courseTitle.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 flex-1 text-left'>
            <p className='text-xs text-slate-500'>Trao tặng cho</p>
            <p className={cn('font-bold text-slate-900', compact ? 'mt-1 text-xl' : 'mt-1 text-2xl sm:text-3xl')}>
              {recipientName}
            </p>
            <p className={cn('text-slate-500', compact ? 'mt-2 text-xs' : 'mt-2 text-sm')}>đã hoàn thành khóa học</p>
            <p className={cn('font-semibold text-slate-900', compact ? 'mt-2 text-sm' : 'mt-2 text-base sm:text-lg')}>
              {courseTitle}
            </p>
          </div>
        </div>

        <div
          className={cn(
            'mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 text-sm sm:grid-cols-3',
            compact && 'mt-5 gap-3 pt-4'
          )}
        >
          <div>
            <p className='text-xs text-slate-500'>Giảng viên</p>
            <div className='mt-1.5 flex items-center gap-2'>
              <Avatar className='h-7 w-7'>
                <AvatarImage src={instructorAvatarUrl ?? undefined} alt={instructorName} className='object-cover' />
                <AvatarFallback className='bg-slate-100 text-[10px] font-semibold text-slate-600'>
                  {instructorName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className='truncate font-medium text-slate-800'>{instructorName}</span>
            </div>
          </div>
          <div>
            <p className='text-xs text-slate-500'>Ngày cấp</p>
            <p className='mt-1.5 font-medium text-slate-800'>{formatCertificateDate(issuedAt)}</p>
          </div>
          <div>
            <p className='text-xs text-slate-500'>Mã chứng chỉ</p>
            <p className='mt-1.5 truncate font-mono font-medium text-slate-800'>{certificateCode}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CertificateValidBadge() {
  return (
    <span className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700'>
      <ShieldCheck className='h-3.5 w-3.5' />
      Chứng chỉ hợp lệ
    </span>
  )
}
