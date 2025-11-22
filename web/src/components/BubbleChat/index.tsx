import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, BotMessageSquare, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import {
    Tooltip,
    TooltipTrigger,
    TooltipContent,
    TooltipProvider,
} from "@/components/ui/tooltip"
import { askAi } from "@/services/ai.service";


interface Message {
    role: "user" | "assistant";
    content: string;
}

const ChatBubble = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [welcomed, setWelcomed] = useState(false);
    const bottomRef = useRef<HTMLDivElement | null>(null);

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userText = input.trim();
        const userMessage: Message = { role: "user", content: userText };
        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);
        setIsTyping(true);

        // Show assistant typing placeholder
        setMessages((prev) => [...prev, { role: "assistant", content: "typing..." }]);

        try {
            const { reply } = await askAi({ message: userText });
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = reply;
                return updated;
            });
        } catch (err: any) {
            const fallback = "Xin lỗi, hiện tại Nova chưa thể trả lời. Vui lòng thử lại sau.";
            setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1].content = fallback;
                return updated;
            });
        } finally {
            setIsTyping(false);
            setIsLoading(false);
        }
    };


    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    useEffect(() => {
        if (!isOpen) return;
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen]);

    // Auto-send a welcome message from AI on first open when empty (no delay)
    useEffect(() => {
        if (!isOpen || welcomed || messages.length > 0) return;
        setWelcomed(true);
        const greeting =
            "Xin chào! 😊 Mình là Nova Compilot. Mình có thể giúp bạn tìm khóa học, giải đáp thắc mắc và gợi ý lộ trình học. Bạn muốn bắt đầu với điều gì?"; setMessages((prev) => [...prev, { role: "assistant", content: greeting }]);
    }, [isOpen, welcomed, messages.length]);

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                onClick={() => setIsOpen(true)}
                                size="lg"
                                className="h-14 w-14 rounded-full bg-gradient-to-br from-teal-400 to-blue-400 shadow-lg shadow-cyan-300/50 hover:shadow-xl hover:shadow-cyan-400/80 flex items-center justify-center transition-all duration-300 hover:scale-110"
                            >
                                <BotMessageSquare className="h-7 w-7" />
                            </Button>
                        </TooltipTrigger>

                        <TooltipContent className="bg-gray-900 text-white px-3 py-2 rounded-lg shadow-lg">
                            Trợ lý AI
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>


            ) : (
                <Card className="w-96 h-[500px] flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-5 duration-300 !py-0">
                    <div className="bg-gradient-to-br from-teal-400 to-blue-400 text-secondary-foreground p-4 rounded-t-lg flex justify-between items-center">
                        <div className="flex items-center gap-2 w-fit">
                            <Bot className="h-5 w-5" />
                            <h3 className="font-semibold">Nova Compilot</h3>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsOpen(false)}
                            className="text-secondary-foreground hover:bg-red-500"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    <ScrollArea className="flex-1 min-h-0 p-4">
                        <div className="space-y-3 pr-1">
                            {messages.length === 0 && (
                                <div className="text-center text-muted-foreground py-8">
                                    <MessageCircle className="h-12 w-12 mx-auto mb-2 text-primary" />
                                    <p className="text-sm">Ask me anything! I'm here to help you learn.</p>
                                </div>
                            )}
                            {messages.map((message, idx) => {
                                const isUser = message.role === "user";
                                return (
                                    <div key={idx} className={`group flex items-end gap-2 ${isUser ? "justify-end" : "justify-start"}`}>

                                        <div
                                            className={`relative max-w-[76%] break-words select-text px-3 py-2 text-sm leading-relaxed shadow-sm ring-1 ${isUser
                                                ? "bg-primary text-primary-foreground ring-black/10 rounded-2xl rounded-br-md"
                                                : "bg-muted text-foreground ring-black/5 rounded-2xl rounded-bl-md"
                                                }`}
                                        >
                                            {message.content === "typing..." ? (
                                                <div className="flex items-center gap-1 text-current">
                                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-.3s]" />
                                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce [animation-delay:-.15s]" />
                                                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-current animate-bounce" />
                                                </div>
                                            ) : (
                                                <div className="whitespace-pre-wrap">{renderWithLinks(message.content)}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            <div ref={bottomRef} />

                        </div>
                    </ScrollArea>

                    <div className="p-4 border-t">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Type your message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                onClick={sendMessage}
                                disabled={isLoading || !input.trim()}
                                size="icon"
                                className="bg-primary hover:bg-primary/90"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default ChatBubble;

// Turn URLs in text into clickable links
function renderWithLinks(text: string) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, idx) => {
        const isUrl = part.startsWith("http://") || part.startsWith("https://");
        if (isUrl) {
            return (
                <a
                    key={idx}
                    href={part}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600 hover:text-blue-700"
                >
                    {part}
                </a>
            );
        }
        return <span key={idx}>{part}</span>;
    });
}
