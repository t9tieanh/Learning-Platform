import { RegisterUpdatedPayload } from './course.dtos';
import prismaService from '~/service/utils/prisma.service'
import { OrderStatus } from '@prisma/client';
import rabbitMQService from '~/service/utils/rabbitmq.service';
import { createEnvelope } from '../events/envelope';
import { CourseMessageType, CourseExchangeNames } from './course.events';
import orderService from '~/service/models/order.service';
import cartService from '~/service/models/cart.service';
import redisService from '~/service/utils/redis.service';
import orderRefundNotificationService from '~/service/utils/order-refund-notification.service';
import Logger from '~/utils/logger';

class CourseHandler {
    private async sendMessage(type: string, payload: any, correlationId: string) {
        const envelope = createEnvelope({ type, payload, correlationId });
        await rabbitMQService.sendMessageTopic(envelope, CourseExchangeNames.APP_EVENTS, type, 'topic', true);
    }

    async handleOrderCreated(message: RegisterUpdatedPayload) {
        try {
            const existing = await prismaService.order.findFirst({
                where: { id: message.orderId },
                select: { id: true, status: true, user_id: true },
            });

            // test rollback transaction
            // throw new Error('test');

            if (!existing) {
                throw new Error('Order not found');
            }

            if (existing.status === OrderStatus.Completed) {
                Logger.info(`Order already completed, skipping: ${message.orderId}`);
                await redisService.publishSagaResult(message.orderId, { success: true });
                return;
            }

            const order = await prismaService.$transaction(async (tx) => {
                const order = await tx.order.findFirst({ where: { id: message.orderId } });
                if (!order) throw new Error('Order not found');
                await tx.order.update({ where: { id: message.orderId }, data: { status: OrderStatus.Completed } });
                return order;
            });

            await redisService.publishSagaResult(message.orderId, { success: true });

            Logger.info(`Successfully completed order: ${message.orderId}`);

            orderService.getOrderInfo(order.user_id, message.orderId)
                .then(async (orderData) => {
                    const correlationId = `order-${order.id}`;
                    const errorMessages: string[] = [];

                    await Promise.all([
                        this.sendMessage(
                            CourseMessageType.NOTIFICATION_SEND,
                            { ...orderData, orderType: 'COURSE' },
                            correlationId
                        ).catch((err) => errorMessages.push(`Failed to send NOTIFICATION_SEND: ${err}`)),
                        this.sendMessage(
                            CourseMessageType.COURSE_PURCHASED_SYNC,
                            {
                                user_id: orderData.user_id,
                                order_id: message.orderId,
                                items: orderData.items.map((item) => ({
                                    course_id: item.course_id
                                }))
                            },
                            correlationId
                        ).catch((err) => errorMessages.push(`Failed to send COURSE_PURCHASED_SYNC: ${err}`)),
                        (async () => {
                            const cartId = await cartService.getCartId(orderData.user_id);
                            const courseIds = orderData.items.map((item) => item.course_id.toString());
                            await cartService.removeManyFromCart(cartId, courseIds);
                        })().catch((err) => errorMessages.push(`Failed to process cart cleanup: ${err}`))
                    ]);

                    if (errorMessages.length > 0) {
                        console.log(`Fire-and-forget tasks failed for order ${message.orderId}:`, errorMessages);
                    }
                })
                .catch((err) => {
                    console.log(`Failed to load order info for fire-and-forget tasks (order ${message.orderId}):`, err);
                });

        } catch (error) {
            Logger.error(`Error completing order, rolling back: ${error}`);

            const [, order] = await Promise.all([
                redisService.publishSagaResult(message.orderId, { success: false, reason: String(error) }),
                prismaService.order.findFirst({
                    where: { id: message.orderId },
                    select: { id: true, user_id: true, total: true, items: { select: { course_id: true, price: true } } }
                })
            ]);

            await this.sendMessage(
                CourseMessageType.ORDER_COMPLETION_FAILED,
                {
                    orderId: order?.id,
                    userId: order?.user_id,
                    amount: order?.total,
                    items: order?.items.map(item => ({ course_id: item.course_id, price: item.price }))
                },
                `order-${order?.id}`
            ).catch((err) => Logger.error(`Failed to send ORDER_COMPLETION_FAILED: ${err}`));
        }
    }

    async handleRegisterUpdateFailed(message: RegisterUpdatedPayload) {
        Logger.error(`Register update failed for order: ${message.orderId}`);

        const order = await prismaService.order.findFirst({
            where: { id: message.orderId },
            select: {
                id: true,
                status: true,
            },
        });

        if (!order) {
            Logger.error(`Register update failed: order not found ${message.orderId}`);
            return;
        }

        if (order.status !== OrderStatus.Cancel) {
            await prismaService.order.update({
                where: { id: message.orderId },
                data: { status: OrderStatus.Cancel },
            });
        }

        await redisService.publishSagaResult(message.orderId, {
            success: false,
            reason: 'Register update failed',
        });

        orderRefundNotificationService
            .sendPaymentRefundNotify(message.orderId)
            .catch((err) => Logger.error(`Failed to send refund notification for order ${message.orderId}: ${err}`));

        Logger.info(`Register update failed handled for order ${message.orderId}`);
    }
}

export default new CourseHandler();
