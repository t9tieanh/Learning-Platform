import { IsString } from 'class-validator';

export class AddToCartRequest {
    @IsString()
    courseId!: string
}