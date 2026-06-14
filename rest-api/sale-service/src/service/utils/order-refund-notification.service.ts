import prismaService from '~/service/utils/prisma.service'
import rabbitMQService from '~/service/utils/rabbitmq.service'
import { createEnvelope } from '~/sagas/events/envelope'
import { CourseMessageType } from '~/sagas/order_course/course.events'
import Logger from '~/utils/logger'

export interface PaymentRefundPayload {
  orderId: string
  user_id: string
  customer_name: string
  customer_email: string
  total: number
}

class OrderRefundNotificationService {
  async sendPaymentRefundNotify(orderId: string): Promise<void> {
    const order = await prismaService.order.findUnique({
      where: { id: orderId },
      select: {
        user_id: true,
        customer_name: true,
        customer_email: true,
        total: true,
      },
    })

    if (!order) {
      Logger.error(`Refund notify: order not found ${orderId}`)
      return
    }

    await this.sendRefundPayload({
      orderId,
      user_id: order.user_id,
      customer_name: order.customer_name,
      customer_email: order.customer_email,
      total: order.total,
    })
  }

  async sendRefundPayload(payload: PaymentRefundPayload): Promise<void> {
    try {
      const envelope = createEnvelope({
        type: CourseMessageType.PAYMENT_REFUND_NOTIFY,
        payload,
        correlationId: `refund-${payload.orderId}`,
      })
      await rabbitMQService.sendMessageTopic(
        envelope,
        'app_events',
        CourseMessageType.PAYMENT_REFUND_NOTIFY,
        'topic',
        true
      )
      Logger.info(`Payment refund notification sent for order ${payload.orderId}`)
    } catch (err) {
      Logger.error(`Failed to send refund notification for order ${payload.orderId}: ${err}`)
    }
  }
}

export default new OrderRefundNotificationService()
