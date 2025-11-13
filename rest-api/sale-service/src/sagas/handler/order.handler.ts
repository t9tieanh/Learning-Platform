import { RegisterUpdatedPayload } from '../order/dtos';
import prismaService from '~/service/utils/prisma.service'
import { OrderStatus } from '@prisma/client'; 
import rabbitMQService from '~/service/utils/rabbitmq.service';
import { createEnvelope } from '../events/envelope';
import { MessageType } from '../order/events';
import orderService from '~/service/models/order.service';

class OrderHandler {
  // send message to other services (notification service / course service)
  private async sendMessage(type: string, payload: any, correlationId: string) {
    const envelope = createEnvelope({ type, payload, correlationId });
    await rabbitMQService.sendMessageTopic(envelope, 'app_events', type, 'topic', true).catch(err => {
      console.error(`Failed to send message [${type}]:`, err);
    });
  }

  // Process when receiving event register.created.v1 -> save order with status Completed 
  async handleOrderCreated(message: RegisterUpdatedPayload) {
    try {
      const order = await prismaService.order.findFirst({ where: { id: message.orderId } });
      if (!order) throw new Error('Order not found');

      // Update status to Completed
      await prismaService.order.update({ where: { id: message.orderId }, data: { status: OrderStatus.Completed } });

      // Send notification
      await this.sendMessage(
        MessageType.NOTIFICATION_SEND,
        await orderService.getOrderInfo(order.user_id, message.orderId),
        `order-${order.id}`
      );

    } catch (error) {
      console.error('Error completing order, rolling back:', error);

      // Rollback order status to Cancel
      const order = await prismaService.order.findFirst({
        where: { id: message.orderId },
        select: { id: true, user_id: true, total: true, items: { select: { course_id: true, price: true } } }
      });

      // Send rollback message to course service
      await this.sendMessage(
        MessageType.ORDER_COMPLETION_FAILED,
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

  // Handle when receiving event register.update.failed.v1
  async handleRegisterUpdateFailed(message: RegisterUpdatedPayload) {
    console.error('Register update failed for order:', message.orderId);
    await prismaService.order.update({ where: { id: message.orderId }, data: { status: OrderStatus.Cancel } });
  }
}

export default new OrderHandler();
