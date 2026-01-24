import axiosClient from '@/lib/axiosClient.lib'
import type { AiChatResponse } from '@/types/ai'
import { ApiResponse } from '@/types/response.type'
import { ConversationLoadResponse } from '@/types/ai'

class ChatBotService {
  async requestToChat(question: string): Promise<ApiResponse<AiChatResponse>> {
    const res = await axiosClient.axiosInstance.post('assistant/chat-bot', {
      question
    })
    return res.data as ApiResponse<AiChatResponse>
  }

  async loadConversation(): Promise<ConversationLoadResponse | null> {
    const res = await axiosClient.axiosInstance.get(`assistant/chat-history`)
    return res.data as ConversationLoadResponse
  }
}

export default new ChatBotService()
