import React from 'react'
import { toast } from 'sonner'

export type ConfirmOptions = {
  title?: React.ReactNode
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  id?: string
  // duration for auto close after user action (not for initial toast)
  duration?: number
}

/**
 * Show a confirmation toast. Returns a Promise resolved with true if confirmed, false otherwise.
 *
 * Usage:
 * const confirmed = await showConfirmToast({ title: 'Bạn có chắc?', description: 'Hành động không thể hoàn tác' })
 */
export function showConfirmToast({
  title = 'Bạn có chắc chắn?',
  description,
  confirmLabel = 'Có, xóa',
  cancelLabel = 'Hủy',
  id,
  duration = 3000
}: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const toastId = id ?? `confirm-${Date.now()}`

    const handleConfirm = (e?: React.MouseEvent) => {
      e?.stopPropagation()
      toast.dismiss(toastId)
      resolve(true)
    }

    const handleCancel = (e?: React.MouseEvent) => {
      e?.stopPropagation()
      toast.dismiss(toastId)
      resolve(false)
    }

    toast(
      <>
        <div className='font-medium'>{title}</div>
        {description && <div className='text-sm text-gray-600 mt-1'>{description}</div>}
        <div className='mt-3 flex items-center gap-2 justify-end'>
          <button
            type='button'
            onClick={handleCancel}
            className='px-3 py-1 rounded-md bg-gray-100 text-gray-800 text-sm'
          >
            {cancelLabel}
          </button>
          <button type='button' onClick={handleConfirm} className='px-3 py-1 rounded-md bg-red-600 text-white text-sm'>
            {confirmLabel}
          </button>
        </div>
      </>,
      {
        id: toastId,
        duration: Infinity,
        closeButton: true
      }
    )

    // safety: if user never interacts, auto-resolve false after max wait (optional)
    // here we do not auto-resolve; uncomment below if you want auto-cancel:
    // setTimeout(() => { if (/*not resolved yet*/ ) { toast.dismiss(toastId); resolve(false) } }, 60000)
  })
}

export default showConfirmToast
