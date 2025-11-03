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
import useDebounce from "@/hooks/useDebounce.hook";
interface ConversationListProps {
  selected?: ConversationListItem | null;
  onSelect: (item: ConversationListItem) => void;
  desiredPeerId?: string;
}

export const ConversationList = ({ selected, onSelect, desiredPeerId }: ConversationListProps) => {
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
          if (mounted) {
            const list = res.result || []
            setConversations(list)
            // Tự động chọn hội thoại đầu tiên khi lần đầu vào trang nếu chưa chọn
            if (!selected && list.length > 0) {
              if (desiredPeerId) {
                const found = list.find((c) => c.peerId === desiredPeerId)
                onSelect(found || list[0])
              } else {
                onSelect(list[0])
              }
            }
          }
        } catch (e) {
          console.error('Load conversations error', e)
        }
      })()
    return () => { mounted = false }
  }, [])

  // Khi desiredPeerId thay đổi (đi theo URL), cố gắng chọn đúng hội thoại
  useEffect(() => {
    if (!desiredPeerId) return
    if (selected?.peerId === desiredPeerId) return
    const found = conversations.find((c) => c.peerId === desiredPeerId)
    if (found) onSelect(found)
  }, [desiredPeerId, conversations])

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

  // Lắng nghe sự kiện chỉnh sửa tin nhắn (update)
  useEffect(() => {
    if (!socket) return

    const onMessageUpdate = (data: {
      conversationId: string
      content: string
      senderId?: string
      peerId?: string
      messageId?: string
    }) => {
      const { conversationId, content } = data
      setConversations(prev => {
        const idx = prev.findIndex(c => c.conversationId === conversationId)
        if (idx === -1) {
          console.log("⚠️ Không tìm thấy hội thoại:", conversationId)
          return prev
        }

        const item = prev[idx]

        if (item.lastMessage && item.lastMessage.content && item.lastMessage._id) {
          const updatedLastMessage = {
            ...item.lastMessage,
            content,
          }

          const updated: ConversationListItem = {
            ...item,
            lastMessage: updatedLastMessage,
          }

          const next = [...prev]
          next[idx] = updated
          return next
        }

        return prev
      })
    }

    socket.on("last_message_update", onMessageUpdate)
    return () => {
      socket.off("last_message_update", onMessageUpdate)
    }
  }, [socket])

  useEffect(() => {
    if (!socket) return;

    const onDeleteLast = (data: {
      conversationId: string;
      deletedMessageId: string;
      newLastMessage?: {
        _id: string;
        content: string;
        senderId: string;
        createdAt: string;
      };
    }) => {
      const { conversationId, newLastMessage } = data;
      console.log("🗑️ message_delete_last:", data);

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.conversationId === conversationId);
        if (idx === -1) return prev;
        const item = prev[idx];

        const updated: ConversationListItem = {
          ...item,
          lastMessage: newLastMessage
            ? {
              _id: newLastMessage._id,
              content: newLastMessage.content,
              senderId: newLastMessage.senderId,
              createdAt: newLastMessage.createdAt,
              senderRole:
                newLastMessage.senderId === myId
                  ? myRole
                  : myRole === "instructor"
                    ? "student"
                    : "instructor",
            }
            : undefined,
          lastMessageAt: newLastMessage?.createdAt,
        };

        const next = [...prev];
        next[idx] = updated;
        return next;
      });
    };

    socket.on("message_delete_last", onDeleteLast);

    return () => {
      socket.off("message_delete_last", onDeleteLast);
    };
  }, [socket, myId, myRole]);

  // Khi người dùng chọn mở một cuộc trò chuyện, reset số lượng tin chưa đọc ở item đó về 0
  // Mục tiêu: đồng bộ UI với trạng thái đã đọc sau khi ChatArea gọi API markRead
  useEffect(() => {
    if (!selected) return
    setConversations((prev) => prev.map(c => c.conversationId === selected.conversationId ? { ...c, unreadCount: 0 } : c))
  }, [selected?.conversationId])

  // Nghe sự kiện cập nhật last message khi xóa/chỉnh sửa ở ChatArea
  useEffect(() => {
    const onLastChanged = (evt: Event) => {
      const { conversationId, lastMessage } = (evt as CustomEvent<{ conversationId: string; lastMessage?: { _id: string; content: string; senderId: string; createdAt: string } }>).detail || {}
      if (!conversationId) return
      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.conversationId === conversationId)
        if (idx === -1) return prev
        const item = prev[idx]
        const computedLast = lastMessage
          ? {
            _id: lastMessage._id,
            content: lastMessage.content,
            senderId: lastMessage.senderId,
            createdAt: lastMessage.createdAt,
            senderRole:
              lastMessage.senderId === myId
                ? myRole
                : myRole === 'instructor'
                  ? 'student'
                  : 'instructor',
          }
          : undefined

        const updated: ConversationListItem = {
          ...item,
          lastMessage: computedLast,
          lastMessageAt: computedLast?.createdAt,
        }
        const next = [...prev]
        next[idx] = updated
        return next
      })
    }
    window.addEventListener('chat:conversation-last-changed', onLastChanged as EventListener)
    return () => window.removeEventListener('chat:conversation-last-changed', onLastChanged as EventListener)
  }, [myId, myRole])



  const filtered = useMemo(() => {
    if (!searchText.trim()) return conversations
    const q = searchText.trim().toLowerCase()
    return conversations.filter(c => (c.peerName || '').toLowerCase().includes(q))
  }, [conversations, searchText])

  return (
    <div className='flex h-full min-h-0 flex-col bg-white border-r border-slate-200'>
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold mb-3 text-[#3c3c3c] tracking-wide pl-1">Đoạn chat</h2>
        </div>
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
                  ? `${c.lastMessage.senderId === myId ? 'Bạn: ' : ''}${c.lastMessage.content}`
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
  )
}
