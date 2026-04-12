import { IsString, IsNotEmpty } from 'class-validator';

export class RAGQuestionRequest {
    @IsString()
    @IsNotEmpty()
    question!: string;
}
