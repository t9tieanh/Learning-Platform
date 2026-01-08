import axiosClient from '@/lib/axiosClient.lib'
import { ConversationLoadResponse } from '@/types/ai'

export interface CreateConversationResponse {
  conversationId: string
  messages: Array<{ role: 'user' | 'ai'; content: string; createdAt?: string }>
}

class AiChatService {
  async createConversation(userId?: string): Promise<CreateConversationResponse> {
    const body = userId ? { userId } : undefined
    console.log('BODY', body)
    const res = await axiosClient.axiosInstance.post('notify/ai/conversation', body)
    return res.data as CreateConversationResponse
  }

  async loadConversation(userId?: string, conversationId?: string): Promise<ConversationLoadResponse | null> {
    if (!userId) return null
    const params = new URLSearchParams()
    params.append('userId', userId)
    if (conversationId) params.append('conversationId', conversationId)
    const res = await axiosClient.axiosInstance.get(`notify/ai/conversation?${params.toString()}`)
    return res.data as ConversationLoadResponse
  }

  async deleteConversation(
    userId?: string,
    conversationId?: string
  ): Promise<{ deleted: boolean; scope: string } | null> {
    if (!userId) return null
    const params = new URLSearchParams()
    params.append('userId', userId)
    if (conversationId) params.append('conversationId', conversationId)
    const res = await axiosClient.axiosInstance.delete(`notify/ai/conversation?${params.toString()}`)
    return res.data as { deleted: boolean; scope: string }
  }
}

export const aiChatService = new AiChatService()
export default aiChatService
