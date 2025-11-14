import RabbitClient from '~/config/rabbitmq'
import { MessageType } from '~/sagas/order/events'
import { QueueName } from '~/sagas/order/queues'
import notificationHandler from '~/sagas/handler/notification.handler'
import { EventEnvelope } from '../events/envelope'
import { NotificationPayload } from '../order/dtos'

export async function initSagas() {
  await RabbitClient.getInstance()
  // routing key of notification_service_queue is notification.send.v1
  await RabbitClient.bindQueueToExchange(QueueName.NOTIFICATION_SERVICE_QUEUE, 'app_events', 'notification.#', 'topic')

  //bind consumer for order_service_queue
  RabbitClient.registerConsumer<NotificationPayload>(
    QueueName.NOTIFICATION_SERVICE_QUEUE,
    'app_events',
    MessageType.NOTIFICATION_SEND,
    async (parsed) => {
      const data = parsed as EventEnvelope<NotificationPayload>
      await notificationHandler.handleSendEmailConfirm(data.payload)
    }
  )
}
