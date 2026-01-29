import { IsString, IsOptional } from 'class-validator';

export class AssemblyAIWebhookDto {
    @IsString()
    status!: string;

    @IsString()
    transcript_id!: string;

    @IsOptional()
    @IsString()
    error?: string;
}
