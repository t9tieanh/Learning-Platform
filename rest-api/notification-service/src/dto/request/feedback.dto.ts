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

export class AddFeedBackDTO {
  @IsNotEmpty()
  courseId: string

  @IsNotEmpty()
  @Type(() => Number)
  @Min(1, { message: 'rating must be a positive number' })
  rating: number

  @IsOptional()
  @IsString()
  comment?: string
}

export interface FeedbackDto {
  id: string
  userId: string
  courseId: string
  rating: number
  message: string
  userName?: string
  userAvatar?: string
}
