import { BookOpen, Eye } from 'lucide-react'
import CustomDialog from '@/components/common/Dialog'
import { LessonPreviewContent, type AdminPreviewLesson } from './LessonPreviewContent'

interface LessonPreviewModalProps {
  open: boolean
  onClose: () => void
  lesson: AdminPreviewLesson | null
}

export function LessonPreviewModal({ open, onClose, lesson }: LessonPreviewModalProps) {
  return (
    <CustomDialog
      open={open}
      setOpen={(v) => {
        if (!v) onClose()
      }}
      hideHeader
      noPadding
      size='full'
      className='flex h-[min(88vh,860px)] max-h-[88vh] w-[min(920px,94vw)] max-w-[920px] flex-col gap-0 overflow-hidden rounded-2xl border-slate-200/80 p-0 sm:max-w-[920px]'
      contentClassName='m-0 flex min-h-0 flex-1 flex-col overflow-hidden'
    >
      {/* Modal header — consistent horizontal padding with body */}
      <div className='shrink-0 border-b border-slate-100 bg-white px-6 pb-4 pt-6 sm:px-8 sm:pt-7'>
        <div className='flex items-start gap-4 pr-8'>
          <span className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm'>
            <BookOpen className='h-5 w-5' />
          </span>
          <div className='min-w-0 flex-1'>
            <h2 className='text-base font-semibold leading-snug text-slate-900 sm:text-lg'>
              Chi tiết bài học
            </h2>
            <p className='mt-1 flex items-center gap-1.5 text-xs text-slate-500 sm:text-sm'>
              <Eye className='h-3.5 w-3.5 shrink-0' />
              Xem nội dung, phân đoạn và bài kiểm tra (chỉ đọc)
            </p>
          </div>
        </div>
      </div>

      {lesson ? (
        <LessonPreviewContent lesson={lesson} />
      ) : (
        <p className='px-8 py-16 text-center text-sm text-slate-500'>Chưa chọn bài học.</p>
      )}
    </CustomDialog>
  )
}

export type { AdminPreviewLesson }
