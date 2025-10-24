import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Phone, Video, MoreVertical, Send, Image, Smile, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  content: string;
  sender: "me" | "other";
  timestamp: string;
}

interface ChatAreaProps {
  conversationId?: string;
  onBack?: () => void;
}

const mockMessages: Message[] = [
  {
    id: "1",
    content: "Chào bạn! Bạn khỏe không?",
    sender: "other",
    timestamp: "14:23",
  },
  {
    id: "2",
    content: "Mình khỏe, cảm ơn bạn nha!",
    sender: "me",
    timestamp: "14:24",
  },
  {
    id: "3",
    content: "Hôm nay bạn có rảnh không? Mình muốn hỏi về dự án",
    sender: "other",
    timestamp: "14:25",
  },
  {
    id: "4",
    content: "Có chứ, bạn cứ hỏi đi",
    sender: "me",
    timestamp: "14:26",
  },
  {
    id: "5",
    content: "Tuyệt vời! Để mình gửi file cho bạn nhé",
    sender: "other",
    timestamp: "14:27",
  },
  {
    id: "5",
    content: "Tuyệt vời! Để mình gửi file cho bạn nhé",
    sender: "other",
    timestamp: "14:27",
  },
  {
    id: "5",
    content: "Tuyệt vời! Để mình gửi file cho bạn nhé",
    sender: "other",
    timestamp: "14:27",
  },
  {
    id: "5",
    content: "Tuyệt vời! Để mình gửi file cho bạn nhé",
    sender: "other",
    timestamp: "14:27",
  },
  {
    id: "5",
    content: "Tuyệt vời! Để mình gửi file cho bạn nhé",
    sender: "other",
    timestamp: "14:27",
  },
  {
    id: "5",
    content: "Tuyệt vời! Để mình gửi file cho bạn nhé",
    sender: "other",
    timestamp: "14:27",
  },
];

export const ChatArea = ({ conversationId, onBack }: ChatAreaProps) => {
  const [message, setMessage] = useState("");

  if (!conversationId) {
    return (
      <div className="flex items-center justify-center h-full bg-background">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold mb-2">Chọn một cuộc trò chuyện</h3>
          <p className="text-muted-foreground">
            Chọn từ danh sách bên trái để bắt đầu nhắn tin
          </p>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (message.trim()) {
      // Handle send message
      setMessage("");
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-card">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onBack}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
            <AvatarFallback>N</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold">Nguyễn Văn A</h3>
            <p className="text-xs text-muted-foreground">Đang hoạt động</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5 " />
          </Button>
          <Button variant="ghost" size="icon">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
        {mockMessages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex items-end gap-2",
              msg.sender === "me" ? "justify-end" : "justify-start"
            )}
          >
            {msg.sender === "other" && (
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=1" />
                <AvatarFallback>N</AvatarFallback>
              </Avatar>
            )}

            <div
              className={cn(
                "max-w-[70%] rounded-2xl px-4 py-2 shadow-sm",
                msg.sender === "me"
                  ? "bg-blue-500 text-white"
                  : "bg-card text-card-foreground border border-border"
              )}
            >
              <p className="text-sm">{msg.content}</p>
              <p
                className={cn(
                  "text-xs mt-1",
                  msg.sender === "me"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                )}
              >
                {msg.timestamp}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-4 border-t  bg-card">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-primary">
            <Image className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-primary">
            <Smile className="h-5 w-5" />
          </Button>

          <Input
            placeholder="Aa"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 border bg-slate-100 rounded-full active:border-2 focus:border-blue-500 active:border-blue-600"
          />

          <Button
            size="icon"   
            onClick={handleSend}
            className="rounded-full bg-blue-500"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
