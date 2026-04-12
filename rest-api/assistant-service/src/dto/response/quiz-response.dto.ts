import { QuestionType, DifficultyLevel, BloomLevel, QuizStatus } from '~/enums/quizStatus.enum'

export class QuizChoiceResponse {
  constructor(text: string, isCorrect: boolean, feedback?: string) {
    this.text = text
    this.isCorrect = isCorrect
    this.feedback = feedback
  }
  text: string
  isCorrect: boolean
  
  id?: string
  order?: number
  feedback?: string
}

export class GeneratedQuizResponse {
  constructor(question: string, type: QuestionType | string, difficulty: DifficultyLevel | string, bloomLevel: BloomLevel | string, choices: QuizChoiceResponse[], explanation: string) {
    this.question = question
    this.type = type
    this.difficulty = difficulty
    this.bloomLevel = bloomLevel
    this.choices = choices
    this.explanation = explanation
  }
  question: string
  type: QuestionType | string
  difficulty: DifficultyLevel | string
  bloomLevel: BloomLevel | string
  choices: QuizChoiceResponse[]
  explanation: string
  
  // Optional fields
  id?: string
  chunkId?: string
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
  constructor(count: number, quizzes: GeneratedQuizResponse[]) {
    this.count = count
    this.quizzes = quizzes
  }
  count: number
  quizzes: GeneratedQuizResponse[]
}

export class ListQuizzesResponse extends Array<GeneratedQuizResponse> {}
