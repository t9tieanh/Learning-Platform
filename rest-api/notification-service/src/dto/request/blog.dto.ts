import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString, Min, Max } from 'class-validator'
import { Type, Transform } from 'class-transformer'

export class CreateBlogDTO {
  @IsString()
  @IsNotEmpty()
  instructor_id: string

  @IsString()
  @IsNotEmpty()
  title: string

  @IsString()
  @IsNotEmpty()
  image_url: string

  // HTML content
  @IsString()
  @IsNotEmpty()
  content: string

  @IsOptional()
  @IsArray()
  @Type(() => String)
  markdown_file_url?: string[] = []
}

export class GetBlogDetailsDTO {
  @IsString()
  @IsMongoId({ message: 'id không hợp lệ' })
  @IsNotEmpty()
  id: string
}

export class GetBlogsDTO {
  @Type(() => Number)
  @Min(1)
  page: number = 1

  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit: number = 10

  @IsOptional()
  @IsString()
  @Transform(({ obj }) => obj.search ?? obj.q ?? '')
  search?: string

  @IsOptional()
  @IsString()
  instructorId?: string
}

export class GetNewBlogsDTO {}

export class GetTrendingBlogsDTO {}

export class UpdateBlogDTO {
  @IsString()
  @IsMongoId({ message: 'id không hợp lệ' })
  @IsNotEmpty()
  id!: string

  @IsOptional()
  @IsString()
  title?: string

  @IsOptional()
  @IsString()
  image_url?: string

  @IsOptional()
  @IsString()
  content?: string

  @IsOptional()
  @IsArray()
  @Type(() => String)
  markdown_file_url?: string[]
}

export class DeleteBlogDTO {
  @IsString()
  @IsMongoId({ message: 'id không hợp lệ' })
  @IsNotEmpty()
  id!: string
}
