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
      <div
        role="dialog"
        aria-labelledby={`${toastId}-title`}
        aria-describedby={description ? `${toastId}-desc` : undefined}
        tabIndex={0}
        onKeyDown={(e: React.KeyboardEvent) => {
          if (e.key === 'Escape') handleCancel()
          if (e.key === 'Enter') handleConfirm()
        }}
        className="w-full max-w-sm sm:max-w-md p-4 rounded-2xl bg-white focus-visible:ring-2 focus-visible:ring-indigo-200"
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-red-50">
              {/* subtle danger icon */}
              <svg className="h-4 w-4 text-red-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.72-1.36 3.485 0l6.518 11.59A1.75 1.75 0 0 1 16.625 18H3.375a1.75 1.75 0 0 1-1.635-2.311L8.257 3.1zM9 7a1 1 0 10-2 0v3a1 1 0 102 0V7zm-1 7a1.25 1.25 0 110-2.5A1.25 1.25 0 019 14z" clipRule="evenodd" />
              </svg>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div id={`${toastId}-title`} className="text-sm font-semibold text-gray-900 leading-snug">
              {title}
            </div>

            {description && (
              <div id={`${toastId}-desc`} className="mt-1 text-sm text-gray-500 leading-relaxed">
                {description}
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-indigo-200"
            aria-label={cancelLabel}
          >
            {/* optional cancel icon */}
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>{cancelLabel}</span>
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-red-600 text-white text-sm font-semibold shadow-sm hover:bg-red-700 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-red-300"
            aria-label={confirmLabel}
          >
            
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>,
      {
        id: toastId,
        duration: Infinity,
      }
    )

    // safety: if user never interacts, auto-resolve false after max wait (optional)
    // here we do not auto-resolve; uncomment below if you want auto-cancel:
    // setTimeout(() => { if (/*not resolved yet*/ ) { toast.dismiss(toastId); resolve(false) } }, 60000)
  })
}

export default showConfirmToast
