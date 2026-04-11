import { QuestionType, DifficultyLevel, BloomLevel, QuizStatus } from '~/enums/quizStatus.enum'

export class QuizChoiceResponse {
  id?: string
  text?: string
  isCorrect?: boolean
  order?: number
}

export class GeneratedQuizResponse {
  id?: string
  chunkId?: string
  question?: string
  type?: QuestionType
  difficulty?: DifficultyLevel
  bloomLevel?: BloomLevel
  choices?: QuizChoiceResponse[]
  explanation?: string
  aiGenerated?: boolean
  aiModel?: string | null
  aiConfidence?: number | null
  isApproved?: boolean
  status?: QuizStatus
  createdBy?: string
  createdAt?: Date
  updatedAt?: Date
}

export class BatchGeneratedQuizzesResponse {
  totalCount?: number
  generatedCount?: number
  quizzes?: GeneratedQuizResponse[]
  generatedAt?: Date
}

export class ListQuizzesResponse extends Array<GeneratedQuizResponse> {}
