import { Type } from 'class-transformer';
import { IsArray, IsUUID, ValidateNested } from 'class-validator';

export class LessonTestStudentAnswerItemDto {
  @IsUUID('4')
  quizId!: string;

  @IsArray()
  @IsUUID('4', { each: true })
  selectedChoiceIds!: string[];
}

export class LessonTestStudentSubmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LessonTestStudentAnswerItemDto)
  answers!: LessonTestStudentAnswerItemDto[];
}
