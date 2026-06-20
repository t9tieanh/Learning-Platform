import { useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { SocketContext } from '@/api/socket/socket.context'
import { useAuthStore } from '@/stores/useAuth.stores'
import chatService from '@/services/chat/chat.service'
import { notifyUnreadConversation } from '@/components/Chat/chatNotification.utils'

const POLL_INTERVAL_MS = 2000
const MAX_ATTEMPTS = 30

export function usePostPaymentChatNotification(enabled: boolean) {
  const navigate = useNavigate()
  const { connectSocket, isConnected } = useContext(SocketContext)
  const myId = useAuthStore((state) => state.data?.userId)

  useEffect(() => {
    if (!enabled || !myId) return

    connectSocket({ user: { id: myId, role: 'student' } })
  }, [enabled, myId, connectSocket])

  useEffect(() => {
    if (!enabled || !myId) return

    let cancelled = false
    let attempts = 0
    let timer: ReturnType<typeof setTimeout> | undefined

    const poll = async () => {
      if (cancelled || attempts >= MAX_ATTEMPTS) return
      attempts += 1

      try {
        const res = await chatService.getConversations('student')
        const items = res.result || []

        for (const conversation of items) {
          const notified = notifyUnreadConversation(conversation, {
            myId,
            pathname: window.location.pathname,
            navigate
          })
          if (notified) return
        }
      } catch (error) {
        console.error(error)
      }

      timer = setTimeout(poll, POLL_INTERVAL_MS)
    }

    poll()

    return () => {
      cancelled = true
      if (timer) clearTimeout(timer)
    }
  }, [enabled, myId, isConnected, navigate])
}
