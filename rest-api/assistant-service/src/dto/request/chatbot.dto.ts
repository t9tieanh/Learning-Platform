import { IsString, IsNotEmpty } from 'class-validator';

export class ChatbotRequest {
    @IsString()
    @IsNotEmpty()
    question!: string;
}
