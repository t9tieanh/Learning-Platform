import { toast } from 'sonner'
import { CHAT_NOTIFICATION_TOASTER_ID } from './ChatNotificationToaster'

type ShowChatNotificationToastParams = {
  title: string
  message: string
  avatar?: string
  onOpen: () => void
}

export function showChatNotificationToast({ title, message, avatar, onOpen }: ShowChatNotificationToastParams) {
  toast.custom(
    () => (
      <div
        role='button'
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onOpen()
          }
        }}
        className='flex w-full gap-3 p-3 pr-10 cursor-pointer'
      >
        {avatar ? (
          <img src={avatar} alt='' className='h-10 w-10 shrink-0 rounded-full object-cover' />
        ) : (
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600'>
            {title.charAt(0).toUpperCase()}
          </div>
        )}
        <div className='min-w-0 flex-1'>
          <div className='truncate text-sm font-semibold text-slate-800'>{title}</div>
          <div className='mt-0.5 line-clamp-2 text-sm text-slate-600'>{message}</div>
          <button
            type='button'
            onClick={(e) => {
              e.stopPropagation()
              onOpen()
            }}
            className='mt-2 text-sm font-medium text-blue-600 hover:underline'
          >
            Xem tin nhắn
          </button>
        </div>
      </div>
    ),
    {
      toasterId: CHAT_NOTIFICATION_TOASTER_ID,
      duration: 8000
    }
  )
}
