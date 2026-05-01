// ---------------------------------------------------------------------------
// Enumerations - Must match backend enums exactly
// ---------------------------------------------------------------------------

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  SHORT_ANSWER = 'SHORT_ANSWER'
}

export enum QuizDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export enum BloomLevel {
  REMEMBER = 'REMEMBER',
  UNDERSTAND = 'UNDERSTAND',
  APPLY = 'APPLY',
  ANALYZE = 'ANALYZE',
  EVALUATE = 'EVALUATE',
  CREATE = 'CREATE'
}

export enum QuizStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

// ---------------------------------------------------------------------------
// Quiz Choice - Multiple choice option
// ---------------------------------------------------------------------------

export interface QuizChoice {
  id: string
  text: string
  isCorrect: boolean
  feedback?: string // "Chính xác!" or "Không chính xác."
}

// ---------------------------------------------------------------------------
// Generated Quiz - Single quiz record from database
// ---------------------------------------------------------------------------

export interface GeneratedQuiz {
  id: string
  /** Present for chunk-scoped quizzes; null/absent for `LESSON_TEST` rows */
  chunkId?: string | null
  type: QuestionType
  difficulty: QuizDifficulty
  bloomLevel: BloomLevel
  question: string
  choices: QuizChoice[]
  explanation: string
  aiGenerated?: boolean
  aiConfidence?: number
  isApproved?: boolean
  status: QuizStatus
  createdAt: string
  updatedAt: string
}

// ---------------------------------------------------------------------------
// API Response DTOs
// ---------------------------------------------------------------------------

/**
 * Response from single quiz generation endpoint
 * Returns a single generated quiz with all details
 */
export interface GeneratedQuizResponse {
  id: string
  chunkId: string
  type: QuestionType
  difficulty: QuizDifficulty
  bloomLevel: BloomLevel
  question: string
  choices: QuizChoice[]
  explanation: string
  aiGenerated?: boolean
  aiConfidence?: number
  isApproved?: boolean
  status: QuizStatus
  createdAt: string
  updatedAt: string
}

/** PATCH `assistant/quizzes/quiz/:quizId` — replaces all choices server-side */
export interface UpdateQuizChoicePayload {
  text: string
  isCorrect: boolean
  feedback?: string | null
}

export interface UpdateQuizPayload {
  question: string
  explanation: string
  type: QuestionType
  difficulty: QuizDifficulty
  /** Omitted from instructor UI — backend keeps existing Bloom or default. */
  bloomLevel?: BloomLevel
  choices: UpdateQuizChoicePayload[]
}

/**
 * Response from batch quiz generation endpoint
 * Returns multiple quizzes organized by distribution
 */
export interface BatchGeneratedQuizResponse {
  chunkId: string
  totalCount: number
  quizzes: GeneratedQuiz[]
}

// ---------------------------------------------------------------------------
// Batch Distribution - For batch generation requests
// ---------------------------------------------------------------------------

export interface QuizBatchDistribution {
  [key: string]: number // "EASY_REMEMBER": 2, "MEDIUM_UNDERSTAND": 3, etc.
}

export interface QuizBatchDistributionItem {
  difficulty: QuizDifficulty
  bloomLevel: BloomLevel
  count: number
}

// Helper to build distribution from UI
export const buildDistribution = (
  difficultyCounts: Record<QuizDifficulty, Record<BloomLevel, number>>
): QuizBatchDistribution => {
  const distribution: QuizBatchDistribution = {}
  Object.entries(difficultyCounts).forEach(([difficulty, bloomLevels]) => {
    Object.entries(bloomLevels).forEach(([bloom, count]) => {
      if (count > 0) {
        distribution[`${difficulty}_${bloom}`] = count
      }
    })
  })
  return distribution
}

// Helper to build array distribution for API
export const buildArrayDistribution = (
  quizzes: Array<{ difficulty: QuizDifficulty; bloomLevel: BloomLevel }>
): QuizBatchDistributionItem[] => {
  const distribution: QuizBatchDistributionItem[] = []
  const countMap = new Map<string, number>()

  quizzes.forEach(({ difficulty, bloomLevel }) => {
    const key = `${difficulty}_${bloomLevel}`
    countMap.set(key, (countMap.get(key) || 0) + 1)
  })

  countMap.forEach((count, key) => {
    const [difficulty, bloomLevel] = key.split('_')
    distribution.push({
      difficulty: difficulty as QuizDifficulty,
      bloomLevel: bloomLevel as BloomLevel,
      count
    })
  })

  return distribution
}

// Helper to parse distribution key
export const parseDistributionKey = (
  key: string
): { difficulty: QuizDifficulty; bloomLevel: BloomLevel } | null => {
  const parts = key.split('_')
  if (parts.length === 2) {
    return {
      difficulty: parts[0] as QuizDifficulty,
      bloomLevel: parts[1] as BloomLevel
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// UI State Types
// ---------------------------------------------------------------------------

export interface QuizGenerationProgress {
  isGenerating: boolean
  currentTask: string
  progress: number // 0-100
  error?: string
}

export interface QuizDisplayState {
  selectedQuizId?: string
  userAnswers: Record<string, string> // quizId -> selectedChoiceId
  showResults: boolean
  expandedQuizzes: Set<string>
}
