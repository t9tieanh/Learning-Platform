import { useState } from "react";
import { ConversationList } from "@/components/Chat/ConversationList";
import { ChatArea } from "@/components/Chat/ChatArea";

const Chat = () => {
    const [selectedConversation, setSelectedConversation] = useState<string>();

    return (
        <div className="flex h-screen overflow-hidden min-h-0">
            {/* Sidebar */}
            <div
                className={`w-full md:w-96 lg:w-[400px] h-full min-h-0 ${selectedConversation ? "hidden md:block" : "block"}`}
            >
                <ConversationList
                    selectedId={selectedConversation}
                    onSelect={setSelectedConversation}
                />
            </div>

            {/* Chat area */}
            <div
                className={`flex-1 h-full min-h-0 overflow-hidden ${selectedConversation ? "block" : "hidden"} md:block`}
            >
                <ChatArea
                    conversationId={selectedConversation}
                    onBack={() => setSelectedConversation(undefined)}
                />
            </div>
        </div>
    );
};

export default Chat;
