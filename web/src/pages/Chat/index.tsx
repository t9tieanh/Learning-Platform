import { useState } from "react";
import { useLocation } from "react-router-dom";
import { ConversationList } from "@/components/Chat/ConversationList";
import { ChatArea } from "@/components/Chat/ChatArea";
import { ConversationListItem } from "@/types/chat.type";

const Chat = () => {
    const [selectedConversation, setSelectedConversation] = useState<ConversationListItem | null>(null);
    const location = useLocation()
    const forcedRole: 'instructor' | 'student' =
        location.pathname.startsWith('/teacher') ? 'instructor' : 'student'

    return (
        <div className="flex h-screen overflow-hidden min-h-0">
            {/* Sidebar */}
            <div
                className={`w-full md:w-96 lg:w-[400px] h-full min-h-0 ${selectedConversation ? "hidden md:block" : "block"}`}
            >
                <ConversationList
                    selected={selectedConversation}
                    onSelect={(c) => setSelectedConversation(c)}
                />
            </div>

            {/* Chat area */}
            <div
                className={`flex-1 h-full min-h-0 overflow-hidden ${selectedConversation ? "block" : "hidden"} md:block`}
            >
                <ChatArea
                    conversationId={selectedConversation?.conversationId}
                    peerId={selectedConversation?.peerId}
                    peerName={selectedConversation?.peerName}
                    peerAvatar={selectedConversation?.peerAvatar}
                    onBack={() => setSelectedConversation(null)}
                    forcedRole={forcedRole}
                />
            </div>
        </div>
    );
};

export default Chat;
