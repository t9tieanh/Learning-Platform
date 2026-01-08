export interface AiChatRequest {
  message: string
  userId?: string
  conversationId?: string
}

export interface AiChatResponse {
  reply: string
}

export interface ConversationMessage {
  role: 'user' | 'ai'
  content: string
  createdAt?: string
}

export interface ConversationLoadResponse {
  conversationId: string
  messages: ConversationMessage[]
}
