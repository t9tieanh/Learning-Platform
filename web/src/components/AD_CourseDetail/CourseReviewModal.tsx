import { useEffect, useState } from 'react'
import { BadgeCheck, Check } from 'lucide-react'
import { AiFillDislike } from 'react-icons/ai'

import CustomDialog from '@/components/common/Dialog'
import QuillEditor from '@/components/common/Input/QuillEditor'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import { Button } from '@/components/ui/button'

function hasEditorContent(html: string) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim().length > 0
}

type ReviewAction = 'approve' | 'reject'

interface CourseReviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialAction?: ReviewAction | null
  courseTitle?: string
  onApprove: () => Promise<void>
  onReject: (reason: string) => Promise<void>
}

export function CourseReviewModal({
  open,
  onOpenChange,
  initialAction = null,
  courseTitle,
  onApprove,
  onReject,
}: CourseReviewModalProps) {
  const [rejectNote, setRejectNote] = useState('')
  const [actionLoading, setActionLoading] = useState<ReviewAction | null>(null)

  useEffect(() => {
    if (!open) {
      setRejectNote('')
      setActionLoading(null)
    }
  }, [open])

  const handleApprove = async () => {
    const confirmed = await showConfirmToast({
      title: 'Phê duyệt khóa học?',
      description: courseTitle
        ? `Khóa học "${courseTitle}" sẽ được xuất bản trên nền tảng sau khi bạn xác nhận.`
        : 'Khóa học sẽ được xuất bản trên nền tảng sau khi bạn xác nhận.',
      confirmLabel: 'Phê duyệt',
      cancelLabel: 'Hủy',
    })
    if (!confirmed) return

    try {
      setActionLoading('approve')
      await onApprove()
      onOpenChange(false)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    const reason = rejectNote.trim()
    if (!hasEditorContent(reason)) return

    const confirmed = await showConfirmToast({
      title: 'Từ chối khóa học?',
      description: courseTitle
        ? `Giảng viên sẽ nhận ghi chú của bạn và cần chỉnh sửa khóa học "${courseTitle}" trước khi gửi lại.`
        : 'Giảng viên sẽ nhận ghi chú của bạn và cần chỉnh sửa khóa học trước khi gửi lại.',
      confirmLabel: 'Từ chối',
      cancelLabel: 'Hủy',
    })
    if (!confirmed) return

    try {
      setActionLoading('reject')
      await onReject(reason)
      onOpenChange(false)
    } finally {
      setActionLoading(null)
    }
  }

  const isRejectDisabled = actionLoading !== null || !hasEditorContent(rejectNote)
  const isApproveDisabled = actionLoading !== null

  return (
    <CustomDialog
      open={open}
      setOpen={onOpenChange}
      size='lg'
      title={
        <span className='flex items-center gap-2 font-semibold text-slate-900'>
          <BadgeCheck className='h-5 w-5 text-blue-600' />
          Phê duyệt / Từ chối khóa học
        </span>
      }
      description={
        initialAction === 'reject'
          ? 'Ghi chú chi tiết để giảng viên biết cần chỉnh sửa những điểm nào trước khi gửi lại.'
          : 'Bạn có thể phê duyệt khóa học để xuất bản hoặc từ chối kèm ghi chú hướng dẫn giảng viên.'
      }
    >
      <div className='space-y-5'>
        {courseTitle && (
          <div className='rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.16em] text-slate-500'>Khóa học</p>
            <p className='mt-1 text-sm font-medium text-slate-900'>{courseTitle}</p>
          </div>
        )}

        <div className='space-y-2'>
          <p className='text-sm font-medium text-slate-700'>
            Ghi chú cho giảng viên
            <span className='ml-1 font-normal text-slate-400'>(bắt buộc khi từ chối)</span>
          </p>
          <QuillEditor
            onChange={setRejectNote}
            className='min-h-[160px] text-slate-700'
          />
        </div>

        <div className='flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-4'>
          <Button
            type='button'
            variant='outline'
            className='rounded-full'
            onClick={() => onOpenChange(false)}
            disabled={actionLoading !== null}
          >
            Hủy
          </Button>
          <Button
            type='button'
            size='sm'
            className='rounded-full bg-rose-500 text-white hover:bg-rose-600'
            onClick={handleReject}
            disabled={isRejectDisabled}
          >
            <AiFillDislike className='mr-1.5 h-4 w-4' />
            {actionLoading === 'reject' ? 'Đang từ chối...' : 'Từ chối'}
          </Button>
          <Button
            type='button'
            size='sm'
            className='rounded-full bg-emerald-600 text-white hover:bg-emerald-700'
            onClick={handleApprove}
            disabled={isApproveDisabled}
          >
            <Check className='mr-1.5 h-4 w-4' />
            {actionLoading === 'approve' ? 'Đang phê duyệt...' : 'Phê duyệt'}
          </Button>
        </div>
      </div>
    </CustomDialog>
  )
}
