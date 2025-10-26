import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, MoreVertical, Send, Image, Paperclip, ChevronLeft } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { SocketContext } from "@/api/socket/socket.context";
import { useLocation } from "react-router-dom";
import chatService from "@/services/chat/chat.service";
import { useAuthStore } from "@/stores/useAuth.stores";

type Role = 'instructor' | 'student'
interface Message {
  id: string;
  content: string;
  senderId: string;
  timestamp: number;
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

  const [peerId, setPeerId] = useState<string>(peerFromProps || "")
  const { data } = useAuthStore()
  const myId = data?.userId
  const location = useLocation()
  console.log('messages', messages);
  // Derive defaults from route if no peer provided: /chat => student u1 chats with u2, /teacher/chat => instructor u2 chats with u1
  useEffect(() => {
    const isTeacher = location.pathname.startsWith('/teacher')
    const defaultRole: Role = forcedRole ?? (isTeacher ? 'instructor' : 'student')
    const defaultPeerId = defaultRole === 'instructor' ? 'u1' : 'u2'
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
            .map(m => ({ id: m._id, content: m.content, senderId: m.senderId, timestamp: new Date(m.createdAt).getTime() }))
          if (mounted) setMessages(mapped)
        } catch (e) {
          console.error('Load messages error', e)
          if (mounted) setMessages([])
        }
      })()
    return () => { mounted = false }
  }, [conversationId])


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
    const onReceive = (data: { senderId: string; message: string; createdAt: number; instructorId?: string; studentId?: string; senderRole?: 'instructor' | 'student' }) => {
      // Avoid duplicating the sender's own optimistic message
      if (data.senderId === myId) return
      setMessages((prev) => [
        ...prev,
        { id: Math.random().toString(36).slice(2), content: data.message, senderId: data.senderId, timestamp: data.createdAt }
      ])
    }
    socket.on('receive_message', onReceive)
    return () => {
      socket.off('receive_message', onReceive)
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
    if (conversationId) {
      chatService.sendMessage({ conversationId, content: payload.message, senderRole: myRole })
        .catch((e) => console.error('sendMessage error', e))
    }
    // Optimistic append
    setMessages((prev) => [
      ...prev,
      { id: Math.random().toString(36).slice(2), content: payload.message, senderId: myId ?? 'unknown', timestamp: Date.now() }
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
            <AvatarImage src={peerAvatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=1"} />
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
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-2",
              msg.senderId === myId ? "justify-end" : "justify-start"
            )}
          >
            {msg.senderId !== myId && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "max-w-[70%] px-4 py-2 rounded-2xl shadow-sm transition-colors",
                msg.senderId === myId
                  ? "bg-blue-500 text-white rounded-br-none"
                  : "bg-white text-gray-800 border border-gray-200 rounded-bl-none"
              )}
            >
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p
                className={cn(
                  "text-[11px] mt-1 text-right",
                  msg.senderId === myId
                    ? "text-blue-100"
                    : "text-gray-400"
                )}
              >
                {new Date(msg.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
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
