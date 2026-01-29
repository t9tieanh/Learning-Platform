import RabbitClient from '~/service/utils/rabbitmq.service'
import { MessageType } from '~/sagas/order/events'
import { QueueName } from '~/sagas/order/queues'
import orderHandler from '~/sagas/handler/order.handler'
import { RegisterUpdatedPayload } from '../order/dtos'
import { EventEnvelope } from '../events/envelope'
import Logger from '~/utils/logger'

export async function initSagas() {
  await RabbitClient.getInstance()

  // tạo + bind queue (tạo queue nếu chưa có)
  // routing key of register_service_queue is order.created.v1
  await RabbitClient.bindQueueToExchange(QueueName.REGISTER_SERVICE_QUEUE, 'app_events', 'order.#', 'topic')
  // routing key of order_service_queue is register.updated.v1
  await RabbitClient.bindQueueToExchange(QueueName.ORDER_SERVICE_QUEUE, 'app_events', 'register.#', 'topic')
  // routing key of notification_service_queue is notification.send.v1
  await RabbitClient.bindQueueToExchange(QueueName.NOTIFICATION_SERVICE_QUEUE, 'app_events', 'notification.#', 'topic')

  //bind consumer for order_service_queue
  RabbitClient.registerConsumer<RegisterUpdatedPayload>(QueueName.ORDER_SERVICE_QUEUE, 'app_events', MessageType.REGISTER_UPDATED, async (parsed) => {
    const data = parsed as EventEnvelope<RegisterUpdatedPayload>
    if (!data.payload || !data.payload.orderId) {
      throw new Error('Invalid payload for register.updated event')
    }

    Logger.info(`data ${JSON.stringify(data)}`)

    if (data.type === MessageType.REGISTER_UPDATED) {
      await orderHandler.handleOrderCreated(data.payload)
    } else {
      await orderHandler.handleRegisterUpdateFailed(data.payload)
    }
  })
}