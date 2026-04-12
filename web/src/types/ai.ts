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

import { QuizDifficulty, BloomLevel } from './quiz'

export interface QuizChoice {
  id: string
  text: string
  isCorrect: boolean
  feedback?: string
}

export interface Quiz {
  id?: string
  question: string
  choices: QuizChoice[]
  explanation: string
  difficulty?: QuizDifficulty
  bloomLevel?: BloomLevel
  aiGenerated?: boolean
  aiConfidence?: number
  isApproved?: boolean
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
