import axiosClient from '@/lib/axiosClient.lib'
import type { AiChatRequest, AiChatResponse } from '@/types/ai'
import { ApiResponse } from '@/types/response.type'

class ChatBotService {
  async askAi(payload: AiChatRequest): Promise<AiChatResponse> {
    const res = await axiosClient.axiosInstance.post('/notify/ai/chat', payload)
    return res.data as AiChatResponse
  }

  async requestToChat(question: string): Promise<ApiResponse<AiChatResponse>> {
    const res = await axiosClient.axiosInstance.post('/chat-bot', {
      question
    })
    return res.data as ApiResponse<AiChatResponse>
  }
}

export default new ChatBotService()
