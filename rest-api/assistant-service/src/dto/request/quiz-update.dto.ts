import {
  BloomLevel,
  DifficultyLevel,
  QuestionType,
} from '~/enums/quizStatus.enum';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';

export class UpdateQuizChoiceDto {
  @IsString()
  @MinLength(1, { message: 'choice text required' })
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsOptional()
  @IsString()
  feedback?: string | null;
}

export class UpdateQuizDto {
  @IsString()
  @MinLength(1, { message: 'question required' })
  question!: string;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsEnum(QuestionType)
  type!: QuestionType;

  @IsEnum(DifficultyLevel)
  difficulty!: DifficultyLevel;

  /** When omitted, server keeps the quiz's current Bloom level (or schema default). */
  @IsOptional()
  @IsEnum(BloomLevel)
  bloomLevel?: BloomLevel;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateQuizChoiceDto)
  choices!: UpdateQuizChoiceDto[];
}

/** Normalized choices after controller trim + validation; passed to persistence. */
export interface NormalizedQuizChoiceInput {
  text: string;
  isCorrect: boolean;
  feedback: string | null;
}

export interface UpdateQuizPersistPayload {
  question: string;
  explanation: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  bloomLevel?: BloomLevel;
  choices: NormalizedQuizChoiceInput[];
}
