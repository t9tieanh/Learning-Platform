import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useContext, useEffect, useMemo, useState } from "react";
import chatService from "@/services/chat/chat.service";
import { ConversationListItem } from "@/types/chat.type";
import { SocketContext } from "@/api/socket/socket.context";
import { useAuthStore } from "@/stores/useAuth.stores";
import { useLocation } from "react-router-dom";

interface ConversationListProps {
  selected?: ConversationListItem | null;
  onSelect: (item: ConversationListItem) => void;
}

export const ConversationList = ({ selected, onSelect }: ConversationListProps) => {
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [searchText, setSearchText] = useState("")
  const { socket } = useContext(SocketContext)
  const { data } = useAuthStore()
  const myId = data?.userId
  const location = useLocation()
  const myRole: 'instructor' | 'student' = location.pathname.startsWith('/teacher') ? 'instructor' : 'student'

  useEffect(() => {
    let mounted = true
      ; (async () => {
        try {
          const res = await chatService.getConversations(myRole)
          if (mounted) setConversations(res.result || [])
        } catch (e) {
          console.error('Load conversations error', e)
        }
      })()
    return () => { mounted = false }
  }, [])

  // Join tất cả phòng theo danh sách hội thoại để nhận realtime preview (kể cả khi chưa mở ChatArea)
  useEffect(() => {
    if (!socket || !myId || conversations.length === 0) return
    for (const c of conversations) {
      const payload = myRole === 'instructor'
        ? { instructorId: myId, studentId: c.peerId }
        : { instructorId: c.peerId, studentId: myId }
      socket.emit('join_room', payload)
    }
  }, [socket, myId, myRole, conversations])

  // Lắng nghe socket để cập nhật last message realtime và move-to-top
  useEffect(() => {
    if (!socket) return
    const onReceive = (payload: { senderId: string; message: string; instructorId?: string; studentId?: string; createdAt: number }) => {
      const { instructorId, studentId, senderId, message, createdAt } = payload
      if (!myId || !instructorId || !studentId) return
      if (myId !== instructorId && myId !== studentId) return
      const peer = myId === instructorId ? studentId : instructorId
      setConversations((prev) => {
        const idx = prev.findIndex(c => c.peerId === peer)
        if (idx === -1) return prev
        const item = prev[idx]
        const updated: ConversationListItem = {
          ...item,
          lastMessage: {
            _id: `temp_${Date.now()}`,
            content: message,
            senderId,
            senderRole: senderId === instructorId ? 'instructor' : 'student',
            createdAt: new Date(createdAt).toISOString()
          },
          lastMessageAt: new Date(createdAt).toISOString(),
          unreadCount: selected && selected.peerId === peer ? item.unreadCount : (item.unreadCount + 1 || 1)
        }
        const next = [updated, ...prev.filter((_, i) => i !== idx)]
        return next
      })
    }
    socket.on('receive_message', onReceive)
    return () => { socket.off('receive_message', onReceive) }
  }, [socket, myId, selected])

  const filtered = useMemo(() => {
    if (!searchText.trim()) return conversations
    const q = searchText.trim().toLowerCase()
    return conversations.filter(c => (c.peerName || '').toLowerCase().includes(q))
  }, [conversations, searchText])

  return (
    <div className="flex h-full min-h-0 flex-col bg-white border-r border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-blue-50 to-blue-100 shadow-sm">
        <h2 className="text-2xl font-bold mb-3 text-blue-600 tracking-wide pl-1">Đoạn chat</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-400" />
          <Input
            placeholder="Tìm kiếm..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="pl-9 !rounded-lg !border !border-slate-300 focus:!border-blue-500 focus:!ring-1 focus:!ring-blue-200 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent">
        {filtered.map((c) => (
          <button
            key={c.conversationId}
            onClick={() => onSelect(c)}
            className={cn(
              "group w-full flex items-center gap-3 p-4 text-left transition-all duration-150 border-b border-slate-100",
              "hover:bg-blue-50/60",
              selected?.conversationId === c.conversationId && "bg-blue-100/60"
            )}
          >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-12 w-12 ring-1 ring-slate-200">
                <AvatarImage src={c.peerAvatar} />
                <AvatarFallback>{(c.peerName || '?')[0]}</AvatarFallback>
              </Avatar>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-0.5">
                <h3 className="font-semibold text-slate-800 truncate">
                  {c.peerName || c.peerId}
                </h3>
                {c.lastMessageAt && (
                  <span className="text-xs text-slate-400 shrink-0 ml-2">
                    {new Date(c.lastMessageAt).toLocaleTimeString()}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500 truncate">
                {c.lastMessage
                  ? `${c.lastMessage.senderId === myId ? 'You: ' : ''}${c.lastMessage.content}`
                  : 'Bắt đầu cuộc trò chuyện'}
              </p>
            </div>

            {/* Unread badge */}
            {!!c.unreadCount && (
              <div className="flex items-center justify-center h-5 min-w-[20px] px-1.5 rounded-full bg-blue-500 text-white text-xs font-semibold">
                {c.unreadCount}
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
