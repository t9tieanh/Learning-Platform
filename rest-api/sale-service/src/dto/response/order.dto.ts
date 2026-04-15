import { OrderStatus } from '@prisma/client';
import { DiscountType } from '@prisma/client';

export interface OrderDto {
    user_id: string;
    customer_name: string;
    customer_email: string;
    total: number;
    status: OrderStatus;
    type?: string;
    discount?: {
        code: string;
        type: DiscountType;
        value: number;
        maxDiscount: number;
    };
    items: {
        course_id: string;
        course_name: string;
        price: number;
        title: string;
        instructor_name: string;
        instructor_id: string;
        image: string;
    }[];
    vip_package?: {
        name: string;
        duration_months: number;
        description?: string;
    };
    ttl?: number;
}