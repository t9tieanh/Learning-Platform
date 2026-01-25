export interface AiChatResponse {
  reply: string
}

export interface ConversationMessage {
  type: 'ai' | 'human'
  content: string
}

export interface ConversationLoadResponse {
  code: number
  message: string
  result: ConversationMessage[]
}
