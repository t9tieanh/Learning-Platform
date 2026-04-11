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

export interface QuizChoice {
  id: string
  text: string
  isCorrect: boolean
}

export interface Quiz {
  id?: string
  question: string
  choices: QuizChoice[]
  explanation: string
}

export interface LessonChunk {
  id: string
  chunkIndex: number
  title: string | null
  summary: string | null
  timestamp: string | null
  startTime: string | null
  endTime: string | null
  sentenceCount: number | null
  content?: string
  quizzes?: Quiz[]
}
