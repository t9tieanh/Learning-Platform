import axiosClient from '@/lib/axiosClient.lib'
import { ApiResponse } from '@/types/response.type'
import { ConversationListItem, CursorPage, MessageItem, SenderRole } from '@/types/chat.type'

class ChatService {
  async getConversations(myRole: string): Promise<ApiResponse<ConversationListItem[]>> {
    const res = await axiosClient.axiosInstance.get('notify/chat/conversations', {
      params: { myRole }
    })
    return res.data
  }

  async createOrGetDirect(
    peerId: string
  ): Promise<ApiResponse<{ conversationId: string; key: string; isNew: boolean }>> {
    const res = await axiosClient.axiosInstance.post('notify/chat/conversations/direct', { peerId })
    return res.data
  }

  async getMessages(params: {
    conversationId: string
    cursor?: string
    limit?: number
  }): Promise<ApiResponse<CursorPage<MessageItem>>> {
    const res = await axiosClient.axiosInstance.get('notify/chat/messages', { params })
    return res.data
  }

    async sendMessage(body: { conversationId: string; content: string; senderRole: SenderRole, peerId: string, senderId: string }): Promise<ApiResponse<MessageItem>> {
        const res = await axiosClient.axiosInstance.post('notify/chat/messages', body)
        return res.data
    }

  async markRead(
    conversationId: string,
    peerId: string,
    messageId?: string
  ): Promise<ApiResponse<{ updated: number }>> {
    const res = await axiosClient.axiosInstance.post('notify/chat/messages/read', { conversationId, peerId, messageId })
    return res.data
  }

    async updateMessage(body: { conversationId: string; messageId: string; content: string, peerId: string }): Promise<ApiResponse<MessageItem>> {
        const res = await axiosClient.axiosInstance.patch('notify/chat/messages', body)
        return res.data
    }

  async deleteMessage(body: { conversationId: string; messageId: string }): Promise<ApiResponse<{ deleted: boolean }>> {
    const res = await axiosClient.axiosInstance.delete('notify/chat/messages', { data: body })
    return res.data
  }
}

export default new ChatService()
