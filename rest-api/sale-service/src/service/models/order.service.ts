import prismaService from '~/service/utils/prisma.service'
import { CreateOrderDto } from '~/dto/request/order.dto';
import userClientGrpc from '~/grpc/userClient.grpc';
import courseClientGrpc from '~/grpc/courseClient.grpc';
import ApiError from '~/middleware/ApiError';
import { OrderStatus, Order } from '@prisma/client';
import redisService from '../utils/redis.service';
import discountService from './discount.service';
import vnpayService from '../../service/utils/vnpay.service'
import { OrderDto } from '~/dto/response/order.dto';

class OrderService {
    async createOrder(orderData: CreateOrderDto, userId: string) : Promise<{
        user_id: string;
        customer_name: string;
        customer_email: string;
        total: number;
        status: OrderStatus;
        items: {
            course_id: string;
            price: number;
        }[];
    }> {
        // check user 
        const user = await userClientGrpc.getUser(userId);
        if (!user) {
            throw new ApiError(200,'Người dùng không tồn tại !');
        }

        // create order items
        const orderItems = await courseClientGrpc.getBulkCourses(
            orderData.items?.map(item => item.courseId as string) || []
        );

        // validate all courses exist
        if (orderItems.length !== (orderData.items || []).length || orderItems.length === 0) {
            throw new ApiError(400, 'Một hoặc nhiều khóa học không tồn tại !');
        }

        const newOrder = {
            ...orderData,
            items: orderItems.map(item => ({
                course_id: item.id as string,
                price: item.final_price as number,
            })),
            user_id: userId,
            customer_name: user.name as string,
            customer_email: user.email as string,
            total: orderItems.reduce((sum, item) => sum + (item.final_price || 0), 0),
            status: OrderStatus.Unconfirmed
        }

        await redisService.set(`order:${userId}`, newOrder, 15 * 60); // TTL 15 minutes

        return newOrder;
    }

    async getOrder(userId: string): Promise<OrderDto> {
        const order = await redisService.get(`order:${userId}`);
        if (!order) {
            throw new ApiError(404, 'Đơn hàng không tồn tại, hoặc đã hết hạn !');
        }
        return {
            ...order,
            ttl: await redisService.getTtl(`order:${userId}`)
        }
    }

    async applyDiscount(userId: string, discountCode: string): Promise<OrderDto> {
        const order = await this.getOrder(userId);
        const basePrice = await this.calculateBasePrice(userId);
        const discount = await discountService.getValidDiscountByCode(discountCode, basePrice);
        const { discountedTotal } = await discountService.calculateDiscountedTotal(discountCode, basePrice);

        // update order in redis
        const updatedOrder = {
            ...order,
            total: discountedTotal,
            discount: {
                code: discount.code,
                type: discount.type,
                value: discount.value
            }
        };
        await redisService.set(`order:${userId}`, updatedOrder, await redisService.getTtl(`order:${userId}`) || 15 * 60);

        return updatedOrder;
    }

    async processPayment(userId: string, paymentMethod: string, ipAddress?: string): Promise<Order & { payment?: { payUrl: string } }> {
        const order = await this.getOrder(userId) as OrderDto;
        if (!order) {
            throw new ApiError(404, 'Đơn hàng không tồn tại, hoặc đã hết hạn !');
        }

        //get discount
        let discount = null;
        if (order.discount?.code) {
            discount = await discountService.getValidDiscountByCode(order.discount?.code as string, order.total);
        }

        //save order to database
        const createdOrder = await prismaService.order.create({
            data: {
                user_id: order.user_id,
                customer_name: order.customer_name,
                customer_email: order.customer_email,
                total: order.total,
                status: OrderStatus.Pending,
                discount_id: discount?.id || null,
                items: {
                    create: order.items.map(item => ({
                        course_id: item.course_id,
                        price: item.price
                    }))
                }
            }
        });

        // process payment via VNPAY
        // Generate VNPAY payment URL
        let payUri: { payUrl: string } | null = null
        if (paymentMethod === 'VNPAY') {
            const amount = createdOrder.total;
            payUri = await vnpayService.createPayment({
                amount,
                orderId: createdOrder.id,
                ipAddr: ipAddress || '127.0.0.1'
            });
        }

        return {
            ...createdOrder,
            payment: {
                payUrl: payUri ? payUri.payUrl : ''
            }
        }
    }

    private async calculateBasePrice(userId: string): Promise<number> {
        const order = await this.getOrder(userId);
        const total = order.items.reduce((sum, item) => sum + item.price, 0);
        return total;
    }
}

export default new OrderService();