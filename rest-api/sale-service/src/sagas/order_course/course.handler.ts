import { RegisterUpdatedPayload } from './course.dtos';
import prismaService from '~/service/utils/prisma.service'
import { OrderStatus } from '@prisma/client';
import rabbitMQService from '~/service/utils/rabbitmq.service';
import { createEnvelope } from '../events/envelope';
import { CourseMessageType, CourseExchangeNames } from './course.events';
import orderService from '~/service/models/order.service';
import cartService from '~/service/models/cart.service';
import redisService from '~/service/utils/redis.service';
import Logger from '~/utils/logger';

class CourseHandler {
    private async sendMessage(type: string, payload: any, correlationId: string) {
        const envelope = createEnvelope({ type, payload, correlationId });
        await rabbitMQService.sendMessageTopic(envelope, CourseExchangeNames.APP_EVENTS, type, 'topic', true).catch(err => {
            Logger.error(`Failed to send message [${type}]: ${err}`);
        });
    }

    async handleOrderCreated(message: RegisterUpdatedPayload) {
        try {
            const order = await prismaService.$transaction(async (tx) => {
                const order = await tx.order.findFirst({ where: { id: message.orderId } });
                if (!order) throw new Error('Order not found');
                await tx.order.update({ where: { id: message.orderId }, data: { status: OrderStatus.Completed } });
                return order;
            });

            // Unblock the payment handler waiting on Redis
            await redisService.publishSagaResult(message.orderId, { success: true });

            Logger.info(`Successfully completed order: ${message.orderId}`);

            // Fire-and-forget: notification & cart cleanup failure should NOT trigger rollback
            orderService.getOrderInfo(order.user_id, message.orderId)
                .then(async (orderData) => {
                    const correlationId = `order-${order.id}`;
                    await Promise.all([
                        this.sendMessage(
                            CourseMessageType.NOTIFICATION_SEND,
                            { ...orderData, orderType: 'COURSE' },
                            correlationId
                        ),
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
                        )
                    ]);
                    try {
                        const cartId = await cartService.getCartId(orderData.user_id);
                        orderData.items.forEach((item) => {
                            cartService.removeFromCart(cartId, item.course_id.toString())
                                .catch(err => Logger.error(`Failed to remove order items from cart: ${err}`));
                        });
                    } catch (err) {
                        Logger.error(`Failed to process cart cleanup: ${err}`);
                    }
                })
                .catch(err => Logger.error(`Failed to send course notification for order ${message.orderId}: ${err}`));

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
            );
        }
    }

    async handleRegisterUpdateFailed(message: RegisterUpdatedPayload) {
        Logger.error(`Register update failed for order: ${message.orderId}`);
        await prismaService.order.update({ where: { id: message.orderId }, data: { status: OrderStatus.Cancel } });
    }
}

export default new CourseHandler();
