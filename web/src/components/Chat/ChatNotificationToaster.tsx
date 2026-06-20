import { Toaster } from '@/components/ui/sonner'

export const CHAT_NOTIFICATION_TOASTER_ID = 'chat-notification'

export function ChatNotificationToaster() {
  return (
    <Toaster
      id={CHAT_NOTIFICATION_TOASTER_ID}
      position='bottom-right'
      expand={false}
      visibleToasts={4}
      gap={12}
      closeButton
      richColors={false}
      style={{ zIndex: 99998 }}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast: 'pointer-events-auto !w-80 !max-w-[calc(100vw-2rem)] !rounded-xl !border !border-slate-200 !bg-white !p-0 !shadow-lg',
          closeButton:
            '!absolute !right-2 !top-2 !left-auto !transform-none !border-slate-200 !bg-white !text-slate-500 hover:!text-slate-800'
        }
      }}
    />
  )
}
