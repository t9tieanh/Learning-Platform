import { IsString, IsNotEmpty, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SearchChunksRequest {
    @IsString()
    @IsNotEmpty()
    lessonId!: string;

    @IsString()
    @IsNotEmpty()
    query!: string;

    @IsOptional()
    @IsNumber()
    @Min(1)
    @Max(20)
    limit?: number = 5;
}
