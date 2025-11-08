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
                title: item.title as string,
                price: item.final_price as number,
                instructor_name: item.instructor.name as string, 
                image: item.thumbnail_url as string
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
                value: discount.value,
                maxDiscount: discount.maxDiscount as number
            }
        };
        await redisService.set(`order:${userId}`, updatedOrder, await redisService.getTtl(`order:${userId}`) || 15 * 60);

        return updatedOrder;
    }

    async processPayment(userId: string, receiveEmail: string, paymentMethod: string, ipAddress?: string): Promise<Order & { payment?: { payUrl: string } }> {
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
                customer_email: receiveEmail,
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

        // del order in redis
        await redisService.del(`order:${userId}`)

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


    // verify otp for vnpay system
    async verifyOrder(query: any): Promise<{ isSuccess: boolean, orderId: string, rawData: any, message: string, rspCode?: string }> {
        const { orderId, amount, status, isValid } = vnpayService.getCallbackInfo(query)
        
        // 1. Validate VNPAY checksum
        if (!isValid) {
            return {
                isSuccess: false,
                orderId: orderId || '',
                rawData: query,
                message: 'Chữ ký không hợp lệ',
                rspCode: '97'
            }
        }

        // 2. Check VNPAY payment status
        if (status !== '00') {
            return {
                isSuccess: false,
                orderId: orderId || '',
                rawData: query,
                message: 'Thanh toán thất bại',
                rspCode: status
            }
        }

        // 3. Check if order exists
        const order = await prismaService.order.findUnique({
            where: { id: orderId }
        })

        if (!order) {
            return {
                isSuccess: false,
                orderId: orderId || '',
                rawData: query,
                message: 'Đơn hàng không tồn tại',
                rspCode: '01'
            }
        }

        // 4. Check if order already processed
        if (order.status === OrderStatus.Completed) {
            return {
                isSuccess: false, // Return success for idempotency
                orderId: orderId,
                rawData: query,
                message: 'Đơn hàng đã được xử lý thành công trước đó',
                rspCode: '00'
            }
        }

        //5. check total ammount
        if (order.total !== amount) {
            return {
                isSuccess: false,
                orderId: orderId,
                rawData: query,
                message: 'Số tiền không hợp lệ',
                rspCode: '00'
            }
        }


        // 6. Process payment confirmation with transaction
        const updatedOrder = await prismaService.$transaction(async (tx) => {
            // Update order status to completed
            return await tx.order.update({
                where: { id: orderId },
                data: { status: OrderStatus.Completed }
            })
        })

        // note -> update course-service + send messase queue to notification service

        //return response successs 
        return {
            isSuccess: true, // Return success for idempotency
            orderId: orderId,
            rawData: updatedOrder,
            message: `Thanh toán đơn hàng ${orderId}! thành công`,
            rspCode: '00'
        }
    }

    async getOrderInfo(userId: string, orderId: string): Promise<OrderDto> {
        const order = await prismaService.order.findFirst({
            where: { id: orderId, user_id: userId },
            select: {
                id: true,
                user_id: true,
                customer_name: true,
                customer_email: true,
                total: true,
                status: true,
                discount: {
                    select: {
                        id: true,
                        code: true,
                        type: true,
                        value: true,
                        maxDiscount: true
                    }
                },
                items: {
                    select: {
                        course_id: true,
                        price: true
                    }
                }
            }
        })

        if (!order) {
            throw new ApiError(401, 'Bạn không có quyền xem order này !')
        }

        // enrich items with course info from course service
        const courseIds = (order.items || []).map(i => i.course_id)
        const courses = await courseClientGrpc.getBulkCourses(courseIds)
        const courseMap = new Map<string, any>(courses.map(c => [c.id, c]))

        const items = (order.items || []).map(i => {
            const c = courseMap.get(i.course_id) || {}
            return {
                course_id: i.course_id,
                price: i.price,
                title: c.title || '',
                instructor_name: c.instructor?.name || '',
                image: c.thumbnail_url || ''
            }
        })

        const result: OrderDto = {
            user_id: order.user_id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            total: order.total,
            status: order.status,
            discount: order.discount ? {
                code: order.discount.code,
                type: order.discount.type,
                value: order.discount.value,
                maxDiscount: order.discount.maxDiscount ?? 0
            } : undefined,
            items,
        }

        return result
    }

    private async calculateBasePrice(userId: string): Promise<number> {
        const order = await this.getOrder(userId);
        const total = order.items.reduce((sum, item) => sum + item.price, 0);
        return total;
    }
}

export default new OrderService();