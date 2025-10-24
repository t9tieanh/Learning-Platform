import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
}

interface ConversationListProps {
  selectedId?: string;
  onSelect: (id: string) => void;
}

const mockConversations: Conversation[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=1",
    lastMessage: "Chào bạn, hẹn gặp lại nhé!",
    time: "2 phút",
    unread: 2,
    online: true,
  },
  {
    id: "2",
    name: "Trần Thị B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=2",
    lastMessage: "Cảm ơn bạn nhiều nha",
    time: "1 giờ",
    online: true,
  },
  {
    id: "3",
    name: "Lê Minh C",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=3",
    lastMessage: "Ok, tôi sẽ xem lại",
    time: "3 giờ",
  },
  {
    id: "4",
    name: "Phạm Thu D",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=4",
    lastMessage: "Bạn có rảnh không?",
    time: "Hôm qua",
  },
  {
    id: "5",
    name: "Hoàng Anh E",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
    lastMessage: "Đã nhận được file rồi",
    time: "Thứ 2",
  },
  {
    id: "5",
    name: "Hoàng Anh E",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
    lastMessage: "Đã nhận được file rồi",
    time: "Thứ 2",
  },
  {
    id: "5",
    name: "Hoàng Anh E",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
    lastMessage: "Đã nhận được file rồi",
    time: "Thứ 2",
  },
  {
    id: "5",
    name: "Hoàng Anh E",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=5",
    lastMessage: "Đã nhận được file rồi",
    time: "Thứ 2",
  },
  
];

export const ConversationList = ({ selectedId, onSelect }: ConversationListProps) => {
  return (
    <div className="flex h-full min-h-0 flex-col bg-card border-r border-border">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-2xl font-bold mb-4">Tin nhắn</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm tin nhắn..."
            className="pl-10 bg-white border-2 border-slate-300 rounded-xl"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {mockConversations.map((conversation) => (
          <button
            key={conversation.id}
            onClick={() => onSelect(conversation.id)}
            className={cn(
              "w-full p-4 flex items-center gap-3 hover:bg-blue-400/20 transition-colors text-left relative",
              selectedId === conversation.id && "bg-blue-400/20"
            )}
          >
            <div className="relative">
              <Avatar className="h-14 w-14">
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback>{conversation.name[0]}</AvatarFallback>
              </Avatar>
              {conversation.online && (
                <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-card" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold truncate">{conversation.name}</h3>
                <span className="text-xs text-muted-foreground">{conversation.time}</span>
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {conversation.lastMessage}
              </p>
            </div>

            {conversation.unread && (
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-semibold">
                  {conversation.unread}
                </span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
