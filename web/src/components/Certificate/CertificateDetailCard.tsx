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
}

export default function CertificateDetailCard({ data, className, showHeader = true }: CertificateDetailCardProps) {
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
      <HighGlossBackground className='px-5 py-4 flex items-center justify-between gap-3'>
        <div className='flex items-center gap-2 min-w-0'>
          <div className='w-8 h-8 rounded-lg bg-white/15 border border-white/20 flex items-center justify-center shrink-0'>
            <Award className='w-4 h-4 text-white' />
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
        'relative px-6 sm:px-10 py-8 sm:py-10 bg-gradient-to-b from-blue-50/40 via-white to-white',
        !showHeader && 'rounded-t-2xl'
      )}>
        <div className='absolute top-4 left-4 w-10 h-10 border-t-2 border-l-2 border-blue-200/80 rounded-tl-lg pointer-events-none' />
        <div className='absolute top-4 right-4 w-10 h-10 border-t-2 border-r-2 border-blue-200/80 rounded-tr-lg pointer-events-none' />
        <div className='absolute bottom-4 left-4 w-10 h-10 border-b-2 border-l-2 border-blue-200/80 rounded-bl-lg pointer-events-none' />
        <div className='absolute bottom-4 right-4 w-10 h-10 border-b-2 border-r-2 border-blue-200/80 rounded-br-lg pointer-events-none' />

        <div className='flex flex-col items-center text-center'>
          <div className='relative mb-5'>
            <Avatar className='w-20 h-20 sm:w-24 sm:h-24 rounded-2xl ring-2 ring-blue-100'>
              <AvatarImage src={courseThumbnailUrl ?? undefined} alt={courseTitle} className='object-cover' />
              <AvatarFallback className='rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-2xl font-bold'>
                {courseTitle.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='absolute -bottom-1.5 -right-1.5 w-8 h-8 rounded-full bg-amber-500 border-2 border-white flex items-center justify-center'>
              <Award className='w-4 h-4 text-white' />
            </div>
          </div>

          <p className='text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500 mb-2'>Chứng nhận trao tặng</p>
          <p className='text-2xl sm:text-3xl font-serif font-bold text-slate-900 mb-2 leading-tight'>{recipientName}</p>
          <p className='text-sm text-slate-500 mb-5 max-w-md'>đã hoàn thành khóa học</p>

          <div className='inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 mb-6 max-w-full'>
            <BookOpen className='w-4 h-4 text-blue-600 shrink-0' />
            <p className='text-base sm:text-lg font-bold text-blue-900 truncate'>{courseTitle}</p>
          </div>

          <div className='flex items-center gap-2.5 mb-6'>
            <Avatar className='w-9 h-9 ring-2 ring-blue-100'>
              <AvatarImage src={instructorAvatarUrl ?? undefined} alt={instructorName} className='object-cover' />
              <AvatarFallback className='bg-blue-100 text-blue-700 text-sm font-bold'>
                {instructorName.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className='text-left min-w-0'>
              <p className='text-[10px] uppercase tracking-wider text-slate-400 font-semibold'>Giảng viên</p>
              <p className='text-sm font-semibold text-slate-800 truncate'>{instructorName}</p>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100'>
          <div className='flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5'>
            <CalendarDays className='w-4 h-4 text-blue-500 shrink-0' />
            <div className='min-w-0 text-left'>
              <p className='text-[10px] uppercase tracking-wider text-slate-400 font-semibold'>Ngày cấp</p>
              <p className='text-xs font-semibold text-slate-700'>{formatCertificateDate(issuedAt)}</p>
            </div>
          </div>
          <div className='flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5'>
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
