import { DifficultyLevel, BloomLevel, QuestionType } from '~/enums/quizStatus.enum'
import { IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class GenerateQuizDto {
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel

  @IsOptional()
  @IsEnum(BloomLevel)
  bloomLevel?: BloomLevel

  @IsOptional()
  @IsEnum(QuestionType)
  questionType?: QuestionType = QuestionType.MULTIPLE_CHOICE

  @IsOptional()
  userPrompt?: string
}

export class QuizDistribution {
  constructor(difficulty?: DifficultyLevel, bloomLevel?: BloomLevel, count: number = 1) {
    this.difficulty = difficulty
    this.bloomLevel = bloomLevel
    this.count = count
  }
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel

  @IsOptional()
  @IsEnum(BloomLevel)
  bloomLevel?: BloomLevel

  @IsNumber()
  @Min(1)
  count: number
}

export class GenerateBatchQuizzesDto {
  constructor(count: number = 1, distribution: QuizDistribution[] = []) {
    this.count = count
    this.distribution = distribution
  }
  @IsNumber()
  @Min(1)
  count: number

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizDistribution)
  distribution: QuizDistribution[]

  @IsOptional()
  userPrompt?: string
}
