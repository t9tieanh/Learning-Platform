import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class RAGQuestionRequest {
    @IsString()
    @IsNotEmpty()
    question!: string;

    /** Optional: continue an existing lesson chat session (must belong to current user + lesson). */
    @IsOptional()
    @IsUUID('4')
    sessionId?: string;
}
