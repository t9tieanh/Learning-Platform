import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Phone, Video, MoreVertical, Send, Image, Paperclip, ChevronLeft, Copy } from 'lucide-react'
import { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { SocketContext } from '@/api/socket/socket.context'
import chatService from '@/services/chat/chat.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import courseUserService, { EnrolledCourseItem } from '@/services/course/course-user.service'
import useLoading from '@/hooks/useLoading.hook'
import noPhoto from '@/assets/images/no-photo.avif'
import { ChatAreaSkeleton } from './Skeleton/ChatAreaSkeleton'

// Loại vai trò của người dùng trong phòng chat
type Role = 'instructor' | 'student'

// Cấu trúc tin nhắn nội bộ hiển thị trong UI
// status: trạng thái chỉ dùng cho tin nhắn do "mình" gửi
//  - 'sent': đã gửi nhưng đối phương chưa đọc
//  - 'read': đối phương đã đọc (nhận qua socket hoặc từ API)
interface Message {
  id: string
  content: string
  senderId: string
  timestamp: number
  status?: 'sent' | 'read'
}
interface ChatAreaProps {
  conversationId?: string
  peerId?: string
  peerName?: string
  peerAvatar?: string
  onBack?: () => void
  forcedRole?: Role
}

export const ChatArea = ({
  conversationId,
  peerId: peerFromProps,
  peerName,
  peerAvatar,
  onBack,
  forcedRole
}: ChatAreaProps) => {
  // console.log('PERR OIIIIII', peerFromProps);
  const { socket, isConnected, connectSocket } = useContext(SocketContext)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [myRole, setMyRole] = useState<'instructor' | 'student'>('student')
  // Ref tới vùng danh sách tin nhắn để auto scroll
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)
  // Chỉnh sửa tin nhắn
  const [editOpen, setEditOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<string>('')
  const [originalValue, setOriginalValue] = useState<string>('')

  const [peerId, setPeerId] = useState<string>(peerFromProps || '')
  const { data } = useAuthStore()
  const myId = data?.userId
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourseItem[]>([])
  const location = useLocation()
  const navigate = useNavigate()
  const { loading: sendingMessage, startLoading: startSending, stopLoading: stopSending } = useLoading()

  useEffect(() => {
    if (peerFromProps && peerFromProps !== peerId) {
      setPeerId(peerFromProps)
    }
  }, [peerFromProps])

  useEffect(() => {
    const isTeacher = location.pathname.startsWith('/teacher')
    const defaultRole: Role = forcedRole ?? (isTeacher ? 'instructor' : 'student')
    const defaultPeerId = defaultRole === 'instructor' ? '' : ''
    setMyRole(defaultRole)
    // If peer provided from props, use it; else set default for quick testing
    setPeerId(peerFromProps || defaultPeerId)
  }, [location.pathname, forcedRole, peerFromProps])

  // Load enrolled courses (tooltip list) when have both roles identified
  useEffect(() => {
    let mounted = true
      ; (async () => {
        if (!myId) return
        // Determine query params based on role: if I'm student -> studentId=myId & instructorId=peerId (if known)
        // If I'm instructor -> instructorId=myId & studentId=peerId (if known)
        const userRole = myRole === 'student' ? 'student' : 'instructor'
        const studentId = myRole === 'student' ? myId : peerId
        const instructorId = myRole === 'instructor' ? myId : peerId
        if (!studentId || !instructorId) return // need both to list shared enrolled courses
        try {
          const res = await courseUserService.getEnrolledCourses({ userRole, studentId, instructorId })
          const items = Array.isArray(res?.result) ? res.result : []
          const mapped: EnrolledCourseItem[] = items.map((c: any) => ({
            id: c.id || c._id || c.courseId || Math.random().toString(36).slice(2),
            title: c.title || 'Không có tiêu đề',
            thumbnailUrl: c.thumbnailUrl || noPhoto
          }))
          if (mounted) setEnrolledCourses(mapped)
        } catch (e) {
          console.error('Fetch enrolled courses error', e)
          if (mounted) setEnrolledCourses([])
        }
      })()
    return () => {
      mounted = false
    }
  }, [myId, peerId, myRole])

  const [loading, setLoading] = useState(false)

  // Load messages when switching conversation
  useEffect(() => {
    let mounted = true
      ; (async () => {
        if (!conversationId) return
        try {
          setLoading(true)
          const res = await chatService.getMessages({ conversationId, limit: 20 })
          const items = res.result?.items || []
          const mapped = items
            .slice()
            .reverse()
            .map((m) => ({
              id: m._id,
              content: m.content,
              senderId: m.senderId,
              timestamp: new Date(m.createdAt).getTime(),
              status: m.status
            }))
          if (mounted) setMessages(mapped)

          try {
            const lastMessage = items[0]
            if (lastMessage && lastMessage.senderId !== myId) {
              await chatService.markRead(conversationId, peerId)
            }
          } catch (e) {
            console.error('markRead on open error', e)
          }
        } catch (e) {
          console.error('Load messages error', e)
          if (mounted) setMessages([])
        } finally {
          if (mounted) setLoading(false)
        }
      })()
    return () => {
      mounted = false
    }
  }, [conversationId, peerId])

  // Hàm scroll xuống cuối danh sách tin nhắn
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = scrollContainerRef.current
    if (!el) return
    // Scroll đến cuối để luôn thấy tin nhắn mới nhất
    el.scrollTo({ top: el.scrollHeight, behavior })
  }

  // Khi đổi cuộc trò chuyện -> scroll ngay lập tức xuống cuối
  useEffect(() => {
    if (!conversationId) return
    // dùng 'auto' để tránh hiệu ứng mượt khi lần đầu mở
    scrollToBottom('auto')
  }, [conversationId])

  // Mỗi khi có thay đổi messages (gửi/nhận) -> scroll mượt xuống cuối
  useEffect(() => {
    if (messages.length === 0) return
    scrollToBottom('smooth')
  }, [messages])

  const ids = useMemo(() => {
    return myRole === 'instructor'
      ? { instructorId: myId, studentId: peerId }
      : { instructorId: peerId, studentId: myId }
  }, [myId, myRole, peerId])

  useEffect(() => {
    if (!isConnected && myId) {
      connectSocket({ user: { id: myId, role: myRole } })
    }
  }, [isConnected, myId, myRole, connectSocket])

  useEffect(() => {
    if (!isConnected || !myId || !peerId) return

    const onReceive = (data: {
      messageId: string
      senderId: string
      message: string
      createdAt: number
      instructorId?: string
      studentId?: string
      senderRole?: 'instructor' | 'student'
    }) => {
      console.log('[ON RECEIVE] Raw data:', data)
      console.log('[ON RECEIVE] myId:', myId)
      console.log('[ON RECEIVE] ids:', ids)

      if (data.senderId === myId) {
        console.log('[ON RECEIVE] Bỏ qua tin của chính mình')
        return
      }

      const sameRoom =
        !!data.instructorId &&
        !!data.studentId &&
        data.instructorId === ids.instructorId &&
        data.studentId === ids.studentId

      console.log('[ON RECEIVE] sameRoom:', sameRoom)

      if (!sameRoom) {
        console.log('[ON RECEIVE] Tin nhắn không cùng phòng -> bỏ qua')
        return
      }

      console.log('[ON RECEIVE] ✅ Thêm tin nhắn vào state')
      setMessages((prev) => [
        ...prev,
        {
          id: data.messageId,
          content: data.message,
          senderId: data.senderId,
          timestamp: data.createdAt
        }
      ])
    }

    // --- Nhận cập nhật tin nhắn (edit) ---
    const onMessageUpdate = (data: { conversationId: string; content: string; messageId: string }) => {
      if (!conversationId || data.conversationId !== conversationId) return
      setMessages((prev) => prev.map((m) => (m.id === data.messageId ? { ...m, content: data.content } : m)))
    }

    // --- Nhận thông báo đã đọc ---
    const onMessageRead = async (payload: { conversationId: string; messageId?: string; readerId: string }) => {
      if (!conversationId || payload.conversationId !== conversationId) return
      try {
        await chatService.markRead(payload.conversationId, payload.readerId)
      } catch (e) {
        console.error('markRead error', e)
      }
      setMessages((prev) => {
        const next = [...prev]
        if (payload.messageId) {
          const idx = next.findIndex((m) => m.id === payload.messageId)
          if (idx !== -1 && next[idx].senderId === myId) {
            next[idx] = { ...next[idx], status: 'read' }
            return next
          }
        }
        for (let i = next.length - 1; i >= 0; i--) {
          if (next[i].senderId === myId) {
            next[i] = { ...next[i], status: 'read' }
            break
          }
        }
        return next
      })
    }

    // --- Khi tin nhắn bị xóa ---
    const onMessageDelete = (data: { conversationId: string; messageId: string }) => {
      console.log('data.conversationId', data.conversationId)
      console.log('conversationId', conversationId)

      if (!conversationId || data.conversationId !== conversationId) return
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId))
    }

    socket.on('receive_message', onReceive)
    socket.on('message_read', onMessageRead)
    socket.on('message_update', onMessageUpdate)
    socket.on('message_delete', onMessageDelete)

    return () => {
      socket.off('receive_message', onReceive)
      socket.off('message_update', onMessageUpdate)
      socket.off('message_read', onMessageRead)
      socket.off('message_delete', onMessageDelete)
    }
  }, [isConnected, socket, ids, myId, peerId, conversationId])

  if (loading) {
    return <ChatAreaSkeleton />
  }

  if (!peerId) {
    return (
      <div className='flex items-center justify-center h-full bg-gray-50'>
        <div className='text-center'>
          <div className='text-6xl mb-4'>💬</div>
          <h3 className='text-xl font-semibold mb-2'>Chọn một cuộc trò chuyện</h3>
          <p className='text-gray-500'>Chọn từ danh sách bên trái để bắt đầu nhắn tin</p>
        </div>
      </div>
    )
  }

  const handleSend = async () => {
    const text = message.trim()
    if (!text) return

    try {
      startSending()
      // Gọi API — backend sẽ lưu DB và emit socket
      const res = await chatService.sendMessage({
        conversationId: conversationId ?? '',
        senderId: myId ?? '',
        senderRole: myRole,
        content: text,
        peerId
      })

      const saved = res?.result
      if (saved) {
        // Thêm tin nhắn mới vào UI khi backend trả về thành công
        setMessages((prev) => [
          ...prev,
          {
            id: saved._id,
            content: saved.content,
            senderId: saved.senderId,
            timestamp: new Date(saved.createdAt).getTime(),
            status: saved.status
            // messageId: saved.messageId,
          }
        ])
      }
      setMessage('')
    } catch (e) {
      console.error('sendMessage error', e)
    } finally {
      stopSending()
    }
  }

  // Copy nội dung tin nhắn
  const handleCopy = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
      toast.success('Đã sao chép nội dung')
    } catch (e) {
      console.error('Copy failed', e)
    }
  }

  const handleDelete = async (id: string) => {
    if (!conversationId) {
      console.warn('No conversationId; skip delete')
      return
    }
    try {
      const res = await chatService.deleteMessage({ conversationId, messageId: id })
      if (res?.result?.deleted) {
        setMessages((prev) => {
          const next = prev.filter((m) => m.id !== id)
          // Nếu xoá tin cuối, cập nhật lại preview ở ConversationList
          const newLast = next[next.length - 1]
          window.dispatchEvent(
            new CustomEvent('chat:conversation-last-changed', {
              detail: {
                conversationId,
                lastMessage: newLast
                  ? {
                    _id: newLast.id,
                    content: newLast.content,
                    senderId: newLast.senderId,
                    createdAt: new Date(newLast.timestamp).toISOString()
                  }
                  : undefined
              }
            })
          )
          return next
        })
        toast.success('Xóa tin nhắn thành công')
      }
    } catch (e) {
      console.error('deleteMessage error', e)
    }
  }

  // Bắt đầu chỉnh sửa
  const handleStartEdit = (id: string, content: string) => {
    setEditingId(id)
    setOriginalValue(content)
    setEditValue(content)
    setEditOpen(true)
  }

  const handleConfirmEdit = async () => {
    if (!editingId || !conversationId) return
    const newText = editValue.trim()
    if (!newText) return
    try {
      const res = await chatService.updateMessage({
        conversationId,
        messageId: editingId,
        content: newText,
        peerId: peerId
      })
      const updated = res?.result
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
              ...m,
              content: updated?.content ?? newText,
              timestamp: updated?.createdAt ? new Date(updated.createdAt).getTime() : m.timestamp
            }
            : m
        )
      )
      toast.success('Cập nhật tin nhắn thành công')
    } catch (e) {
      toast.error('Cập nhật thất bại')
    } finally {
      setEditOpen(false)
      setEditingId(null)
    }
  }

  const tooltipTitle = myRole === 'instructor' ? 'Khóa học đã tham gia' : 'Khóa học đang mở bán'

  const courseList = (
    <div className='flex flex-col gap-2 p-2 w-64 max-h-[300px] overflow-y-auto'>
      {enrolledCourses.length === 0 && <div className='text-xs text-gray-400 px-1 py-2'>Không có khóa học</div>}

      {enrolledCourses.length > 0 && (
        <p className='text-base pl-1 font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent'>
          {tooltipTitle}
        </p>
      )}

      {enrolledCourses.length > 0 && (
        <p className='text-base pl-1 font-semibold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent'>
          {tooltipTitle}
        </p>
      )}

      {enrolledCourses.map((course) => (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div
          key={course.id}
          onClick={() => handleCourseClick(course.id)}
          className='flex items-center gap-3 p-1 rounded-md hover:bg-gray-100 transition cursor-pointer'
        >
          <img src={course.thumbnailUrl || ''} alt={course.title} className='w-10 h-10 rounded-md object-cover' />
          <span className='text-sm font-medium text-gray-800 truncate'>{course.title}</span>
        </div>
      ))}
    </div>
  )

  const handleCourseClick = (id: string) => {
    if (myRole === 'instructor') {
      navigate(`/teacher/course-details/${id}`)
    } else {
      navigate(`/course/${id}`)
    }
  }

  return (
    <div className='flex flex-col flex-1 h-full min-h-0 bg-gray-50'>
      {/* Header */}
      <div className='flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm'>
        <div className='flex items-center gap-3'>
          {onBack && (
            <Button variant='ghost' size='icon' className='md:hidden text-gray-600 hover:bg-gray-100' onClick={onBack}>
              <ChevronLeft className='h-5 w-5' />
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className='flex items-center gap-3 cursor-pointer'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={peerAvatar} />
                    <AvatarFallback>{(peerName || peerId || 'N')[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className='font-semibold text-gray-800'>{peerName || peerId}</h3>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side='bottom' className='bg-white shadow-xl border rounded-xl p-0'>
                {courseList}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className='flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'
      >
        <div className='space-y-4'>
          {messages.map((msg, index) => {
            const isMine = msg.senderId === myId
            const isLastMyMessage = isMine && messages.slice(index + 1).findIndex((m) => m.senderId === myId) === -1

            return (
              <div key={msg.id} className={cn('group flex items-end gap-2', isMine ? 'justify-end' : 'justify-start')}>
                {!isMine && (
                  <Avatar className='h-8 w-8'>
                    <AvatarImage src={peerAvatar} />
                    <AvatarFallback>N</AvatarFallback>
                  </Avatar>
                )}

                {isMine && (
                  <div className='mr-1 opacity-0 group-hover:opacity-100 transition'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-7 w-7 hover:text-blue-500 hover:bg-transparent'
                      onClick={() => handleCopy(msg.content)}
                    >
                      <Copy className='h-4 w-4 ' />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-7 w-7 hover:bg-gray-100 hover:text-blue-500 hover:bg-transparent'
                        >
                          <MoreVertical className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align='start'
                        side='bottom'
                        sideOffset={4}
                        className='w-40 -translate-x-32 -translate-y-4'
                      >
                        <DropdownMenuItem onClick={() => handleDelete(msg.id)}>Xoá tin nhắn</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStartEdit(msg.id, msg.content)}>
                          Chỉnh sửa tin
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                )}

                <div
                  className={cn(
                    'max-w-[70%] px-4 py-2 rounded-2xl shadow-sm transition-colors',
                    isMine
                      ? 'bg-blue-500 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  )}
                >
                  <p className='text-sm leading-relaxed'>{msg.content}</p>
                  <p
                    className={cn('text-[11px] mt-1 text-right space-x-1', isMine ? 'text-blue-100' : 'text-gray-400')}
                  >
                    <span className='font-medium'>
                      {new Date(msg.timestamp).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className='opacity-70'>
                      {new Date(msg.timestamp).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit'
                      })}
                    </span>
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trạng thái đọc */}
        {(() => {
          const lastMyMsg = messages[messages.length - 1]
          if (!lastMyMsg || lastMyMsg.senderId !== myId) return null
          return (
            <div className='flex justify-end pr-4 mt-1'>
              <p className='text-[12px] text-gray-400 italic'>{lastMyMsg.status === 'read' ? 'Đã đọc' : 'Đã nhận'}</p>
            </div>
          )
        })()}
      </div>

      {/* Input */}
      <div className='p-4 bg-white border-t shadow-sm'>
        <div className='flex items-center gap-3'>
          <Input
            placeholder='Nhập tin nhắn...'
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className='flex-1 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 px-4 py-2 text-sm placeholder-gray-500'
          />

          <Button
            size='icon'
            onClick={handleSend}
            disabled={sendingMessage}
            className='rounded-full bg-blue-500 hover:bg-blue-600 transition'
          >
            <Send className='h-5 w-5 text-white' />
          </Button>
        </div>
      </div>

      {/* Dialog chỉnh sửa tin nhắn */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa tin nhắn</DialogTitle>
          </DialogHeader>
          <div className='mt-2'>
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleConfirmEdit()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant='outline' onClick={() => setEditOpen(false)}>
              Huỷ
            </Button>
            <Button
              onClick={handleConfirmEdit}
              disabled={editValue.trim() === originalValue.trim() || editValue.trim() === ''}
            >
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
