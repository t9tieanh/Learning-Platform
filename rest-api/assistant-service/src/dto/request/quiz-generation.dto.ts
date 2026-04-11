import { DifficultyLevel, BloomLevel, QuestionType } from '~/enums/quizStatus.enum'
import { IsEnum, IsOptional, IsNumber, IsArray, ValidateNested, Min, IsIn } from 'class-validator'
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
  @IsIn(['en', 'vi'])
  language?: 'en' | 'vi' = 'en'
}

export class QuizDistribution {
  @IsOptional()
  @IsEnum(DifficultyLevel)
  difficulty?: DifficultyLevel

  @IsOptional()
  @IsEnum(BloomLevel)
  bloomLevel?: BloomLevel

  @IsNumber()
  @Min(1)
  count?: number
}

export class GenerateBatchQuizzesDto {
  @IsNumber()
  @Min(1)
  count?: number

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizDistribution)
  distribution?: QuizDistribution[]

  @IsOptional()
  @IsIn(['en', 'vi'])
  language?: 'en' | 'vi' = 'en'
}
