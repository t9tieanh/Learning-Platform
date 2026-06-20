import { useContext, useEffect, useMemo, useState } from 'react'
import { SocketContext } from '@/api/socket/socket.context'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuth.stores'
import chatService from '@/services/chat/chat.service'
import { getChatNavigation, notifyChatMessage, notifyUnreadConversation } from '@/components/Chat/chatNotification.utils'

type MessageNotificationPayload = {
  senderId: string
  message: string
  instructorId?: string
  studentId?: string
  createdAt?: number
  conversationId?: string
  messageId?: string
}

function resolveChatRole(authRole: string | undefined, pathname: string): 'instructor' | 'student' {
  if (pathname.startsWith('/teacher')) return 'instructor'
  const normalized = authRole?.toLowerCase() ?? ''
  if (normalized.includes('instructor') || normalized === 'teacher') return 'instructor'
  return 'student'
}

export default function GlobalChatNotifier() {
  const { socket, isConnected, connectSocket } = useContext(SocketContext)
  const location = useLocation()
  const navigate = useNavigate()
  const { data } = useAuthStore()
  const myId = data?.userId
  const myRole = useMemo(
    () => resolveChatRole(data?.role, location.pathname),
    [data?.role, location.pathname]
  )
  const activePeerId = useMemo(() => {
    const match = location.pathname.match(/\/(?:teacher\/)?chat\/([^/]+)/)
    return match?.[1]
  }, [location.pathname])

  const [peerMap, setPeerMap] = useState<Record<string, { name: string; avatar?: string; conversationId?: string }>>({})
  const [joinedRole, setJoinedRole] = useState<string | null>(null)

  useEffect(() => {
    if (!isConnected && myId) {
      connectSocket({ user: { id: myId, role: myRole } })
    }
  }, [isConnected, myId, myRole, connectSocket])

  useEffect(() => {
    if (!isConnected) {
      setJoinedRole(null)
    }
  }, [isConnected])

  useEffect(() => {
    if (!socket || !myId || !isConnected) return
    socket.emit('join_user_inbox', myId)
  }, [socket, myId, isConnected])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!socket || !myId || !isConnected) return
      if (joinedRole === myRole) return
      try {
        const res = await chatService.getConversations(myRole)
        const items = res.result || []
        if (cancelled) return

        const map: Record<string, { name: string; avatar?: string; conversationId?: string }> = {}
        for (const c of items) {
          map[c.peerId] = { name: c.peerName || c.peerId, avatar: c.peerAvatar, conversationId: c.conversationId }
          const payload =
            myRole === 'instructor'
              ? { instructorId: myId, studentId: c.peerId }
              : { instructorId: c.peerId, studentId: myId }
          socket.emit('join_room', payload)

          notifyUnreadConversation(c, {
            myId,
            pathname: location.pathname,
            activePeerId,
            navigate
          })
        }
        setPeerMap(map)
        setJoinedRole(myRole)
      } catch (e) {
        console.error(e)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [socket, myId, myRole, isConnected, joinedRole, location.pathname, activePeerId, navigate])

  useEffect(() => {
    if (!socket || !myId) return

    const onNotification = (payload: MessageNotificationPayload) => {
      const { senderId, message, instructorId, studentId, messageId, createdAt } = payload
      const { peerId } = getChatNavigation(myId, instructorId, studentId, location.pathname)

      if (peerId && instructorId && studentId) {
        socket.emit('join_room', { instructorId, studentId })
      }

      const info = peerId ? peerMap[peerId] : undefined

      notifyChatMessage({
        myId,
        messageId,
        senderId,
        message,
        instructorId,
        studentId,
        pathname: location.pathname,
        activePeerId,
        navigate,
        title: info?.name,
        avatar: info?.avatar,
        createdAt
      })
    }

    socket.on('message_notification', onNotification)
    return () => {
      socket.off('message_notification', onNotification)
    }
  }, [socket, myId, activePeerId, navigate, peerMap, location.pathname])

  return null
}
