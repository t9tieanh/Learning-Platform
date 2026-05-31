import prismaService from '~/service/utils/prisma.service'
import { CreateOrderDto } from '~/dto/request/order.dto';
import userClientGrpc from '~/grpc/userClient.grpc';
import courseClientGrpc from '~/grpc/courseClient.grpc';
import ApiError from '~/middleware/ApiError';
import { OrderStatus, Order, OrderType } from '@prisma/client';
import redisService from '../utils/redis.service';
import discountService from './discount.service';
import vnpayService from '../../service/utils/vnpay.service'
import { OrderDto } from '~/dto/response/order.dto';
import momoService from '../utils/momo.service';
import payosService from '../utils/payos.service';

class OrderService {
    async createOrder(orderData: CreateOrderDto, userId: string): Promise<{
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
            throw new ApiError(200, 'Người dùng không tồn tại !');
        }

        //check sale is bued by user
        for (const item of orderData.items || []) {
            const hasPurchased = await prismaService.order_Item.findFirst({
                where: {
                    course_id: item.courseId,
                    order: {
                        user_id: userId,
                        status: OrderStatus.Completed
                    }
                }
            });
            if (hasPurchased) {
                throw new ApiError(400, `Bạn đã mua khóa học ${hasPurchased.course_id} trước đó !`);
            }
        }

        // create order items
        const orderItems = await courseClientGrpc.getBulkCourses(
            orderData.items?.map(item => item.courseId as string) || []
        );

        // validate all courses exist
        if (orderItems.length !== (orderData.items || []).length || orderItems.length === 0) {
            throw new ApiError(400, 'Một hoặc nhiều khóa học không tồn tại !');
        }

        // check userId is instructor of any course
        for (const item of orderItems) {
            if (item.instructor.id === userId) {
                throw new ApiError(403, 'Giảng viên không thể mua khóa học của mình !');
            }
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
            status: OrderStatus.Pending
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
        const amount = createdOrder.total;
        if (paymentMethod === 'VNPAY') {
            payUri = await vnpayService.createPayment({
                amount,
                orderId: createdOrder.id,
                ipAddr: ipAddress || '127.0.0.1'
            });
        } else if (paymentMethod === 'MOMO') {
            payUri = await momoService.createPayment({
                amount,
                orderId: createdOrder.id,
                ipAddr: ipAddress || '127.0.0.1'
            });
        } else if (paymentMethod === 'PAYOS') {
            payUri = await payosService.createPayment({
                amount,
                orderId: createdOrder.id,
            });
        }

        return {
            ...createdOrder,
            payment: {
                payUrl: payUri ? payUri.payUrl : ''
            }
        }
    }

    async processVipPayment(userId: string, receiveEmail: string, paymentMethod: string, ipAddress?: string): Promise<Order & { payment?: { payUrl: string } }> {
        // check user 
        const user = await userClientGrpc.getUser(userId);
        if (!user) {
            throw new ApiError(404, 'Người dùng không tồn tại !');
        }

        // Fetch VIP package from DB instead of hardcoding
        const vipPackage = await prismaService.vipPackage.findFirst();
        if (!vipPackage) {
            throw new ApiError(404, 'Không tìm thấy thông tin gói VIP trên hệ thống!');
        }

        const vipPrice = vipPackage.price;

        // save VIP order directly to database
        const createdOrder = await prismaService.order.create({
            data: {
                user_id: userId,
                customer_name: user.name as string,
                customer_email: receiveEmail || user.email as string,
                total: vipPrice,
                status: OrderStatus.Pending,
                type: OrderType.VIP_SUBSCRIPTION,
                // no items for VIP subscription
            }
        });

        // Generate VNPAY / MOMO payment URL
        let payUri: { payUrl: string } | null = null
        if (paymentMethod === 'VNPAY') {
            payUri = await vnpayService.createPayment({
                amount: vipPrice,
                orderId: createdOrder.id,
                ipAddr: ipAddress || '127.0.0.1',
                type: OrderType.VIP_SUBSCRIPTION
            });
        } else if (paymentMethod === 'MOMO') {
            payUri = await momoService.createPayment({
                amount: vipPrice,
                orderId: createdOrder.id,
                ipAddr: ipAddress || '127.0.0.1',
                type: OrderType.VIP_SUBSCRIPTION
            });
        } else if (paymentMethod === 'PAYOS') {
            payUri = await payosService.createPayment({
                amount: vipPrice,
                orderId: createdOrder.id,
                type: OrderType.VIP_SUBSCRIPTION,
            });
        }

        return {
            ...createdOrder,
            payment: {
                payUrl: payUri ? payUri.payUrl : ''
            }
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
                type: true,
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
            const course = courseMap.get(i.course_id) || {}
            return {
                course_id: i.course_id,
                price: i.price,
                title: course.title || '',
                instructor_name: course.instructor?.name || '',
                instructor_id: course.instructor?.id || '',
                course_name: course.title || '',
                image: course.thumbnail_url || ''
            }
        })

        let vipPackageData = undefined;
        if (order.type === 'VIP_SUBSCRIPTION') {
            const vipPackage = await prismaService.vipPackage.findFirst();
            if (vipPackage) {
                vipPackageData = {
                    name: vipPackage.name,
                    duration_months: vipPackage.duration_months,
                    description: vipPackage.description || undefined
                };
            }
        }

        const result: OrderDto = {
            user_id: order.user_id,
            customer_name: order.customer_name,
            customer_email: order.customer_email,
            total: order.total,
            status: order.status,
            type: order.type,
            discount: order.discount ? {
                code: order.discount.code,
                type: order.discount.type,
                value: order.discount.value,
                maxDiscount: order.discount.maxDiscount ?? 0
            } : undefined,
            items,
            vip_package: vipPackageData
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