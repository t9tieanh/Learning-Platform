import { OrderStatus } from '@prisma/client';
import { DiscountType } from '@prisma/client';

export interface OrderDto {
    user_id: string;
    customer_name: string;
    customer_email: string;
    total: number;
    status: OrderStatus;
    discount?: {
        code: string;
        type: DiscountType;
        value: number;
    };
    items: {
        course_id: string;
        price: number;
    }[];
    ttl: number;
}