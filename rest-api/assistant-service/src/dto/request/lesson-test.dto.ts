import {
  IsArray,
  ArrayMaxSize,
  ArrayMinSize,
  Allow,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { LessonTestStatus } from '@prisma/client';

export class PutLessonTestDto {
  @IsOptional()
  @IsString()
  title?: string | null;

  @IsOptional()
  @IsEnum(LessonTestStatus)
  status?: LessonTestStatus;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500)
  targetTotalQuestions?: number | null;

  @IsOptional()
  @IsString()
  notes?: string | null;
}

/** Bulk enqueue: each group uses `questionCount`, `distribution`, and `batchUserPrompt` persisted on its row (create/PATCH chunk group). No lesson-wide shared userPrompt. */
export class BulkGenerateLessonTestDto {
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  groupIds?: string[];
}

export class CreateLessonTestChunkGroupDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsUUID('4', { each: true })
  chunkIds!: string[];

  @IsInt()
  @Min(1)
  @Max(100)
  questionCount!: number;

  @IsOptional()
  @IsString()
  label?: string | null;

  @IsOptional()
  @Allow()
  distribution?: unknown;

  @IsOptional()
  @IsString()
  batchUserPrompt?: string | null;
}

export class PatchLessonTestChunkGroupDto {
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @IsUUID('4', { each: true })
  chunkIds?: string[];

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  questionCount?: number;

  @IsOptional()
  @IsString()
  label?: string | null;

  @IsOptional()
  @Allow()
  distribution?: unknown;

  @IsOptional()
  @IsString()
  batchUserPrompt?: string | null;
}

export class GenerateLessonTestGroupQuizzesDto {
  @IsOptional()
  @IsString()
  userPrompt?: string;
}
