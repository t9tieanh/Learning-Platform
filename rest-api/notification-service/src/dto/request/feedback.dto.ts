import { IsNotEmpty, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class GetFeedBackDTO {
  @IsString()
  @IsNotEmpty()
  courseId: string

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: 'limit must be a positive number' })
  limit?: number = 10

  @IsOptional()
  @IsString()
  cursor?: string
}
