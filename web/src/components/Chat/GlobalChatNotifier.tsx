import { useContext, useEffect, useState, useRef } from 'react'
import { SocketContext } from '@/api/socket/socket.context'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuth.stores'
import chatService from '@/services/chat/chat.service'

interface ToastItem {
  id: string
  title: string
  message: string
  avatar?: string
  senderName?: string
  at: number
  onClick?: () => void
}

export default function GlobalChatNotifier() {
  const { socket, isConnected, connectSocket } = useContext(SocketContext)
  const location = useLocation()
  const navigate = useNavigate()
  const { data } = useAuthStore()
  const myId = data?.userId
  const isOnChatPage = location.pathname.includes('/chat') || location.pathname.includes('/teacher/chat')
  const myRole: 'instructor' | 'student' = location.pathname.startsWith('/teacher') ? 'instructor' : 'student'

  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [peerMap, setPeerMap] = useState<Record<string, { name: string; avatar?: string; conversationId?: string }>>({})
  const [joinedRole, setJoinedRole] = useState<string | null>(null)

  // Ensure socket connection exists globally
  useEffect(() => {
    if (!isConnected && myId) {
      connectSocket({ user: { id: myId, role: myRole } })
    }
  }, [isConnected, myId, myRole, connectSocket])

  // Join all conversation rooms so we receive events while outside chat pages
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!socket || !myId || !isConnected) return
      if (joinedRole === myRole) return
      try {
        const res = await chatService.getConversations(myRole)
        const items = res.result || []
        if (cancelled) return
        // Build peer info map for toast rendering
        const map: Record<string, { name: string; avatar?: string; conversationId?: string }> = {}
        for (const c of items) {
          map[c.peerId] = { name: c.peerName || c.peerId, avatar: c.peerAvatar, conversationId: c.conversationId }
          const payload =
            myRole === 'instructor'
              ? { instructorId: myId, studentId: c.peerId }
              : { instructorId: c.peerId, studentId: myId }
          socket.emit('join_room', payload)
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
  }, [socket, myId, myRole, isConnected, joinedRole])

  // Listen for messages and show toast if not on chat page and incoming
  useEffect(() => {
    if (!socket) return
    const onReceive = (payload: {
      senderId: string
      message: string
      instructorId?: string
      studentId?: string
      createdAt: number
    }) => {
      if (!myId) return
      const { senderId, message, instructorId, studentId, createdAt } = payload
      if (senderId === myId) return // ignore own
      if (isOnChatPage) return // don't show toast on chat pages
      const peerId = myId === instructorId ? studentId : instructorId
      const info = peerId ? peerMap[peerId] : undefined
      const title = info?.name || 'Tin nhắn mới'
      const id = Math.random().toString(36).slice(2)
      const at = createdAt || Date.now()
      const onClick = () => {
        const base = myRole === 'instructor' ? '/teacher/chat' : '/chat'
        if (peerId) navigate(`${base}/${peerId}`)
        else navigate(base)
      }
      setToasts((prev) => [...prev, { id, title, message, at, onClick, avatar: info?.avatar, senderName: info?.name }])
      // Auto dismiss
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 5000)
    }
    socket.on('receive_message', onReceive)
    return () => {
      socket.off('receive_message', onReceive)
    }
  }, [socket, myId, isOnChatPage, navigate, myRole, peerMap])

  if (toasts.length === 0) return null

  return (
    <div className='fixed bottom-4 right-4 z-[1000] space-y-3 pointer-events-none'>
      {toasts.map((t) => (
        <div
          key={t.id}
          className='pointer-events-auto w-80 bg-white border border-slate-200 shadow-lg rounded-lg p-3 flex gap-3 animate-in fade-in slide-in-from-bottom-2'
        >
          {t.avatar && (
            <img src={t.avatar} alt='avatar' className='h-10 w-10 rounded-full object-cover flex-shrink-0' />
          )}
          <div className='flex-1 min-w-0'>
            <div className='text-sm font-semibold text-slate-800 truncate'>{t.title}</div>
            <div className='text-sm text-slate-600 truncate'>{t.message}</div>
            <div className='mt-1 text-[11px] text-slate-400'>{new Date(t.at).toLocaleTimeString()}</div>
          </div>
          <button onClick={t.onClick} className='text-blue-600 text-sm font-medium hover:underline ml-2'>
            Mở
          </button>
        </div>
      ))}
    </div>
  )
}
