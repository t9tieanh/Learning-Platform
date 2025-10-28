import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, MoreVertical, Send, Image, Paperclip, ChevronLeft } from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { SocketContext } from "@/api/socket/socket.context";
import { useLocation } from "react-router-dom";
import chatService from "@/services/chat/chat.service";
import { useAuthStore } from "@/stores/useAuth.stores";

// Loại vai trò của người dùng trong phòng chat
type Role = 'instructor' | 'student'

// Cấu trúc tin nhắn nội bộ hiển thị trong UI
// status: trạng thái chỉ dùng cho tin nhắn do "mình" gửi
//  - 'sent': đã gửi nhưng đối phương chưa đọc
//  - 'read': đối phương đã đọc (nhận qua socket hoặc từ API)
interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
  status?: 'sent' | 'read'
}
interface ChatAreaProps {
  conversationId?: string;
  peerId?: string;
  peerName?: string;
  peerAvatar?: string;
  onBack?: () => void;
  forcedRole?: Role
}

export const ChatArea = ({ conversationId, peerId: peerFromProps, peerName, peerAvatar, onBack, forcedRole }: ChatAreaProps) => {


  const { socket, isConnected, connectSocket, disconnectSocket } = useContext(SocketContext)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [myRole, setMyRole] = useState<"instructor" | "student">("student")
  // Ref tới vùng danh sách tin nhắn để auto scroll
  const scrollContainerRef = useRef<HTMLDivElement | null>(null)

  const [peerId, setPeerId] = useState<string>(peerFromProps || "")
  const { data } = useAuthStore()
  const myId = data?.userId
  const location = useLocation()
  useEffect(() => {
    const isTeacher = location.pathname.startsWith('/teacher')
    const defaultRole: Role = forcedRole ?? (isTeacher ? 'instructor' : 'student')
    const defaultPeerId = defaultRole === 'instructor' ? '' : ''
    setMyRole(defaultRole)
    // If peer provided from props, use it; else set default for quick testing
    setPeerId(peerFromProps || defaultPeerId)
  }, [location.pathname, forcedRole, peerFromProps])

  // Load messages when switching conversation
  useEffect(() => {
    let mounted = true
      ; (async () => {
        if (!conversationId) return
        try {
          const res = await chatService.getMessages({ conversationId, limit: 20 })
          const items = res.result?.items || []
          const mapped = items
            .slice() // ensure copy before reverse
            .reverse() // server returns newest-first; we want oldest-first display
            .map(m => ({ id: m._id, content: m.content, senderId: m.senderId, timestamp: new Date(m.createdAt).getTime(), status: m.status }))
          if (mounted) setMessages(mapped)
          // Gọi API đánh dấu đã đọc khi người dùng mở cuộc trò chuyện
          // Mục đích: xóa số tin chưa đọc và bắn socket thông báo cho đối phương (server đảm nhiệm)
          try {
            await chatService.markRead(conversationId)
          } catch (e) {
            console.error('markRead on open error', e)
          }
        } catch (e) {
          console.error('Load messages error', e)
          if (mounted) setMessages([])
        }
      })()
    return () => { mounted = false }
  }, [conversationId])

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
    socket.emit('join_room', ids)
    // Lắng nghe tin nhắn mới đến và append vào UI
    const onReceive = (data: { senderId: string; message: string; createdAt: number; instructorId?: string; studentId?: string; senderRole?: 'instructor' | 'student' }) => {
      // Avoid duplicating the sender's own optimistic message
      if (data.senderId === myId) return
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(36).slice(2), content: data.message, senderId: data.senderId, timestamp: data.createdAt }
      ])
      // Khi đang mở cuộc trò chuyện, đánh dấu đã đọc ngay lập tức
      if (conversationId) {
        chatService.markRead(conversationId).catch((e) => console.error('markRead on receive error', e))
      }
    }
    socket.on('receive_message', onReceive)

    // Lắng nghe thông báo đã đọc từ đối phương để cập nhật trạng thái tin nhắn của mình
    // Kỳ vọng payload có conversationId và (tuỳ chọn) messageId đã được đọc
    const onMessageRead = (payload: { conversationId: string; messageId?: string; readerId: string }) => {
      if (!conversationId || payload.conversationId !== conversationId) return
      // Cập nhật trạng thái 'read' cho tin nhắn gần nhất do mình gửi
      setMessages((prev) => {
        const next = [...prev]
        // Ưu tiên tìm theo messageId, nếu không có thì lấy tin nhắn gần nhất do mình gửi
        if (payload.messageId) {
          const idx = next.findIndex(m => m.id === payload.messageId)
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
    socket.on('message_read', onMessageRead)
    return () => {
      socket.off('receive_message', onReceive)
      socket.off('message_read', onMessageRead)
    }
  }, [isConnected, socket, ids, myId, peerId])

  if (!peerId) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
          <p className="text-gray-500">
            Chọn từ danh sách bên trái để bắt đầu nhắn tin
          </p>
        </div>
      </div>
    );
  }

  // Gửi tin nhắn: phát socket + lưu DB + append optimistic
  // Đồng thời, hiển thị trạng thái 'Đã gửi' cho tin nhắn của mình, và sẽ cập nhật thành 'Đã đọc' khi nhận socket từ đối phương
  const handleSend = () => {
    if (!message.trim()) return
    const payload = {
      message: message.trim(),
      senderId: myId,
      senderRole: myRole as Role,
      instructorId: ids.instructorId,
      studentId: ids.studentId,
    }
    socket.emit('send_message', payload)
    // Persist via REST (fire-and-forget)
    let tempId = Math.random().toString(36).slice(2)
    if (conversationId) {
      chatService
        .sendMessage({ conversationId, content: payload.message, senderRole: myRole })
        .then((res) => {
          const saved = res.result
          // Cập nhật lại id và status dựa theo kết quả server cho bản ghi optimistic
          setMessages((prev) => {
            if (!saved) return prev
            const next = [...prev]
            const idx = next.findIndex(m => m.id === tempId)
            if (idx !== -1) {
              next[idx] = {
                ...next[idx],
                id: saved._id,
                status: saved.status,
                timestamp: new Date(saved.createdAt).getTime(),
              }
            }
            return next
          })
        })
        .catch((e) => console.error('sendMessage error', e))
    }
    // Optimistic append
    setMessages((prev) => [
      ...prev,
      { id: tempId, content: payload.message, senderId: myId ?? 'unknown', timestamp: Date.now(), status: 'sent' }
    ])
    setMessage("")
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-gray-600 hover:bg-gray-100"
              onClick={onBack}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={peerAvatar} />
            <AvatarFallback>{(peerName || peerId || 'N')[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-800">{peerName || peerId}</h3>
            <p className="text-xs text-green-500">● Đang hoạt động</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent"
      >
        <div className="space-y-4">
          {messages.map((msg, index) => {
            const isMine = msg.senderId === myId
            const isLastMyMessage =
              isMine &&
              messages.slice(index + 1).findIndex((m) => m.senderId === myId) === -1

            return (
              <div
                key={msg.id}
                className={cn(
                  "flex items-end gap-2",
                  isMine ? "justify-end" : "justify-start"
                )}
              >
                {!isMine && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={peerAvatar} />
                    <AvatarFallback>N</AvatarFallback>
                  </Avatar>
                )}

                <div
                  className={cn(
                    "max-w-[70%] px-4 py-2 rounded-2xl shadow-sm transition-colors",
                    isMine
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
                  )}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p
                    className={cn(
                      "text-[11px] mt-1 text-right",
                      isMine ? "text-blue-100" : "text-gray-400"
                    )}
                  >
                    {new Date(msg.timestamp).toLocaleTimeString()}
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
            <div className="flex justify-end pr-4 mt-1">
              <p className="text-[12px] text-gray-400 italic">
                {lastMyMsg.status === 'read' ? 'Đã đọc' : 'Đã nhận'}
              </p>
            </div>
          )
        })()}
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t shadow-sm">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
            <Image className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-gray-500 hover:bg-gray-100">
            <Paperclip className="h-5 w-5" />
          </Button>

          <Input
            placeholder="Nhập tin nhắn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full bg-gray-100 border-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-0 px-4 py-2 text-sm placeholder-gray-500"
          />

          <Button
            size="icon"
            onClick={handleSend}
            className="rounded-full bg-blue-500 hover:bg-blue-600 transition"
          >
            <Send className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </div>
  );
};
