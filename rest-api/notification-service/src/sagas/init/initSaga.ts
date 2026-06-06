import RabbitClient from '~/config/rabbitmq'
import { MessageType } from '~/sagas/order/events'
import { QueueName } from '~/sagas/order/queues'
import notificationHandler from '~/sagas/handler/notification.handler'
import paymentRefundHandler from '~/sagas/handler/payment-refund.handler'
import { EventEnvelope } from '../events/envelope'
import { NotificationPayload, PaymentRefundPayload } from '../order/dtos'

export async function initSagas() {
  await RabbitClient.getInstance()

  await RabbitClient.bindQueueToExchange(
    QueueName.NOTIFICATION_SERVICE_QUEUE,
    'app_events',
    MessageType.NOTIFICATION_SEND,
    'topic'
  )
  await RabbitClient.bindQueueToExchange(
    QueueName.PAYMENT_REFUND_SERVICE_QUEUE,
    'app_events',
    MessageType.PAYMENT_REFUND_NOTIFY,
    'topic'
  )

  RabbitClient.registerConsumer<NotificationPayload>(
    QueueName.NOTIFICATION_SERVICE_QUEUE,
    'app_events',
    MessageType.NOTIFICATION_SEND,
    async (parsed) => {
      const data = parsed as EventEnvelope<NotificationPayload>
      if (data.type !== MessageType.NOTIFICATION_SEND) return
      await notificationHandler.handleSendEmailConfirm(data.payload)
    }
  )

  RabbitClient.registerConsumer<PaymentRefundPayload>(
    QueueName.PAYMENT_REFUND_SERVICE_QUEUE,
    'app_events',
    MessageType.PAYMENT_REFUND_NOTIFY,
    async (parsed) => {
      const data = parsed as EventEnvelope<PaymentRefundPayload>
      if (data.type !== MessageType.PAYMENT_REFUND_NOTIFY) return
      await paymentRefundHandler.handlePaymentRefund(data.payload)
    }
  )
}
