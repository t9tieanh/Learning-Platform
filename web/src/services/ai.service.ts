import axiosClient from '@/lib/axiosClient.lib'
import type { AiChatRequest, AiChatResponse } from '@/types/ai'

export async function askAi(payload: AiChatRequest): Promise<AiChatResponse> {
    const res = await axiosClient.axiosInstance.post('/notify/ai/chat', payload)
    return res.data as AiChatResponse
}

const aiService = { askAi }
export default aiService
