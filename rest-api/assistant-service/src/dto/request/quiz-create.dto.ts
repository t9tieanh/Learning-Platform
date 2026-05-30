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

export class CreateQuizChoiceDto {
  @IsString()
  @MinLength(1, { message: 'choice text required' })
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;

  @IsOptional()
  @IsString()
  feedback?: string | null;
}

export class CreateManualQuizDto {
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

  @IsEnum(BloomLevel)
  bloomLevel!: BloomLevel;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizChoiceDto)
  choices!: CreateQuizChoiceDto[];
}
