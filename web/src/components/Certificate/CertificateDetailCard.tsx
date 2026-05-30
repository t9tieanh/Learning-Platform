import { Award, BookOpen, CalendarDays, Hash, ShieldCheck } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import HighGlossBackground from '@/components/common/HighGlossBackground'
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
        'relative w-full max-w-[720px] mx-auto overflow-hidden rounded-2xl border-2 border-blue-100 bg-white',
        className
      )}
    >
      {showHeader && (
      <HighGlossBackground className={cn('flex items-center justify-between gap-3', compact ? 'px-4 py-2.5' : 'px-5 py-4')}>
        <div className='flex items-center gap-2 min-w-0'>
          <div className={cn(
            'rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0',
            compact ? 'w-7 h-7' : 'w-8 h-8'
          )}>
            <Award className={compact ? 'w-3.5 h-3.5 text-white' : 'w-4 h-4 text-white'} />
          </div>
          <div className='min-w-0'>
            <p className='text-[10px] font-black uppercase tracking-[0.25em] text-white/90'>Learnova Certificate</p>
            <p className='text-[11px] text-blue-100/75 font-medium truncate'>Chứng nhận hoàn thành khóa học</p>
          </div>
        </div>
        <span className='text-[10px] font-mono text-blue-100/80 shrink-0 hidden sm:inline'>{certificateCode}</span>
      </HighGlossBackground>
      )}

      <div className={cn(
        'relative bg-gradient-to-b from-blue-50/40 via-white to-white',
        compact ? 'px-4 sm:px-6 py-5' : 'px-6 sm:px-10 py-8 sm:py-10',
        !showHeader && 'rounded-t-2xl'
      )}>
        <div className={cn(
          'absolute border-blue-200/80 pointer-events-none',
          compact ? 'top-3 left-3 w-7 h-7 border-t-2 border-l-2 rounded-tl-lg' : 'top-4 left-4 w-10 h-10 border-t-2 border-l-2 rounded-tl-lg'
        )} />
        <div className={cn(
          'absolute border-blue-200/80 pointer-events-none',
          compact ? 'top-3 right-3 w-7 h-7 border-t-2 border-r-2 rounded-tr-lg' : 'top-4 right-4 w-10 h-10 border-t-2 border-r-2 rounded-tr-lg'
        )} />
        <div className={cn(
          'absolute border-blue-200/80 pointer-events-none',
          compact ? 'bottom-3 left-3 w-7 h-7 border-b-2 border-l-2 rounded-bl-lg' : 'bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 rounded-bl-lg'
        )} />
        <div className={cn(
          'absolute border-blue-200/80 pointer-events-none',
          compact ? 'bottom-3 right-3 w-7 h-7 border-b-2 border-r-2 rounded-br-lg' : 'bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 rounded-br-lg'
        )} />

        <div className='flex flex-col items-center text-center'>
          <div className={cn('relative', compact ? 'mb-3' : 'mb-5')}>
            <Avatar className={cn(
              'rounded-2xl ring-2 ring-blue-100',
              compact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'
            )}>
              <AvatarImage src={courseThumbnailUrl ?? undefined} alt={courseTitle} className='object-cover' />
              <AvatarFallback className={cn(
                'rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold',
                compact ? 'text-lg' : 'text-2xl'
              )}>
                {courseTitle.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              'absolute -bottom-1 -right-1 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center',
              compact ? 'w-6 h-6' : 'w-8 h-8 -bottom-1.5 -right-1.5'
            )}>
              <Award className={compact ? 'w-3 h-3 text-white' : 'w-4 h-4 text-white'} />
            </div>
          </div>

          <p className={cn('font-bold uppercase tracking-[0.2em] text-blue-500', compact ? 'text-[10px] mb-1' : 'text-[11px] mb-2')}>
            Chứng nhận trao tặng
          </p>
          <p className={cn(
            'font-serif font-bold text-slate-900 leading-tight',
            compact ? 'text-xl mb-1' : 'text-2xl sm:text-3xl mb-2'
          )}>
            {recipientName}
          </p>
          <p className={cn('text-slate-500 max-w-md', compact ? 'text-xs mb-3' : 'text-sm mb-5')}>
            đã hoàn thành khóa học
          </p>

          <div className={cn(
            'inline-flex items-center gap-2 rounded-xl bg-blue-50 border border-blue-100 max-w-full',
            compact ? 'px-3 py-1.5 mb-3' : 'px-4 py-2 mb-6'
          )}>
            <BookOpen className='w-4 h-4 text-blue-600 shrink-0' />
            <p className={cn('font-bold text-blue-900 truncate', compact ? 'text-sm' : 'text-base sm:text-lg')}>
              {courseTitle}
            </p>
          </div>

          <div className={cn('flex items-center gap-2.5', compact ? 'mb-3' : 'mb-6')}>
            <Avatar className={cn('ring-2 ring-blue-100', compact ? 'w-8 h-8' : 'w-9 h-9')}>
              <AvatarImage src={instructorAvatarUrl ?? undefined} alt={instructorName} className='object-cover' />
              <AvatarFallback className='bg-blue-100 text-blue-700 text-sm font-bold'>
                {instructorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='text-left min-w-0'>
              <p className='text-[10px] uppercase tracking-wider text-slate-400 font-semibold'>Giảng viên</p>
              <p className={cn('font-semibold text-slate-800 truncate', compact ? 'text-xs' : 'text-sm')}>
                {instructorName}
              </p>
            </div>
          </div>
        </div>

        <div className={cn(
          'grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-100',
          compact ? 'pt-3 gap-2' : 'pt-4'
        )}>
          <div className={cn(
            'flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60',
            compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
          )}>
            <CalendarDays className='w-4 h-4 text-blue-500 shrink-0' />
            <div className='min-w-0 text-left'>
              <p className='text-[10px] uppercase tracking-wider text-slate-400 font-semibold'>Ngày cấp</p>
              <p className='text-xs font-semibold text-slate-700'>{formatCertificateDate(issuedAt)}</p>
            </div>
          </div>
          <div className={cn(
            'flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60',
            compact ? 'px-2.5 py-2' : 'px-3 py-2.5'
          )}>
            <Hash className='w-4 h-4 text-blue-500 shrink-0' />
            <div className='min-w-0 text-left'>
              <p className='text-[10px] uppercase tracking-wider text-slate-400 font-semibold'>Mã chứng chỉ</p>
              <p className='text-xs font-mono font-semibold text-slate-700 truncate'>{certificateCode}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function CertificateValidBadge() {
  return (
    <div className='inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700'>
      <ShieldCheck className='w-4 h-4' />
      <span className='text-xs font-bold uppercase tracking-wide'>Chứng chỉ hợp lệ</span>
    </div>
  )
}
