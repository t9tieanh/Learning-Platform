import RabbitClient from '~/service/utils/rabbitmq.service'
import { EventEnvelope } from '../events/envelope'
import Logger from '~/utils/logger'

// Buy VIP Domain
import vipHandler from '~/sagas/buy_vip/vip.handler'
import { VipMessageType } from '~/sagas/buy_vip/vip.events'
import { VipQueueName } from '~/sagas/buy_vip/vip.queues'
import { VipRegisterUpdatedPayload, VipRegisterFailedPayload } from '~/sagas/buy_vip/vip.dtos'

// Order Course Domain
import courseHandler from '~/sagas/order_course/course.handler'
import { CourseMessageType } from '~/sagas/order_course/course.events'
import { CourseQueueName } from '~/sagas/order_course/course.queues'
import { RegisterUpdatedPayload } from '~/sagas/order_course/course.dtos'

export async function initSagas() {
  await RabbitClient.getInstance()

  // ─── Course Order Domain ────────────────────────────────────────────────────
  // Outbound: sale-service → course-service  (order.created.v1)
  await RabbitClient.bindQueueToExchange(CourseQueueName.REGISTER_SERVICE_QUEUE, 'app_events', 'order.#', 'topic')
  // Reply:   course-service → sale-service  (register.updated / register.update.failed)
  await RabbitClient.bindQueueToExchange(CourseQueueName.ORDER_SERVICE_QUEUE, 'app_events', 'register.#', 'topic')
  // Notifications
  await RabbitClient.bindQueueToExchange(CourseQueueName.NOTIFICATION_SERVICE_QUEUE, 'app_events', 'notification.#', 'topic')
  // Assistant: sync user purchased courses
  await RabbitClient.bindQueueToExchange(CourseQueueName.ASSISTANT_COURSE_PURCHASE_QUEUE, 'app_events', 'course.purchased.#', 'topic')

  // ─── VIP Domain ────────────────────────────────────────────────────────────
  // Outbound: sale-service → user-service  (vip.register.created.v1)
  await RabbitClient.bindQueueToExchange(VipQueueName.VIP_PACKAGE_REGISTER_SERVICE_QUEUE, 'app_events', 'vip.register.created.v1', 'topic')
  // Reply:   user-service → sale-service  (vip.register.updated / vip.register.failed)
  await RabbitClient.bindQueueToExchange(VipQueueName.VIP_ORDER_SERVICE_QUEUE, 'app_events', 'vip.register.updated.v1', 'topic')
  await RabbitClient.bindQueueToExchange(VipQueueName.VIP_ORDER_SERVICE_QUEUE, 'app_events', 'vip.register.failed.v1', 'topic')

  // ─── Course reply consumer ──────────────────────────────────────────────────
  RabbitClient.registerConsumer<any>(
    CourseQueueName.ORDER_SERVICE_QUEUE,
    'app_events',
    [CourseMessageType.REGISTER_UPDATED, CourseMessageType.REGISTER_UPDATE_FAILED],
    async (parsed) => {
      const data = parsed as EventEnvelope<any>
      if (!data.payload || !data.payload.orderId) {
        throw new Error(`Invalid payload for event ${data.type}`)
      }

      Logger.info(`[ORDER_SERVICE_QUEUE] received ${data.type}`)

      if (data.type === CourseMessageType.REGISTER_UPDATED) {
        await courseHandler.handleOrderCreated(data.payload as RegisterUpdatedPayload)
      } else if (data.type === CourseMessageType.REGISTER_UPDATE_FAILED) {
        await courseHandler.handleRegisterUpdateFailed(data.payload as RegisterUpdatedPayload)
      } else {
        Logger.warn(`Unhandled message type in ORDER_SERVICE_QUEUE: ${data.type}`)
      }
    }
  )

  // ─── VIP reply consumer ─────────────────────────────────────────────────────
  RabbitClient.registerConsumer<any>(
    VipQueueName.VIP_ORDER_SERVICE_QUEUE,
    'app_events',
    [VipMessageType.VIP_REGISTER_UPDATED, VipMessageType.VIP_REGISTER_FAILED],
    async (parsed) => {
      const data = parsed as EventEnvelope<any>
      if (!data.payload || !data.payload.orderId) {
        throw new Error(`Invalid payload for VIP event ${data.type}`)
      }

      Logger.info(`[VIP_ORDER_SERVICE_QUEUE] received ${data.type}`)

      if (data.type === VipMessageType.VIP_REGISTER_UPDATED) {
        await vipHandler.handleVipRegisterUpdated(data.payload as VipRegisterUpdatedPayload)
      } else if (data.type === VipMessageType.VIP_REGISTER_FAILED) {
        await vipHandler.handleVipRegisterFailed(data.payload as VipRegisterFailedPayload)
      } else {
        Logger.warn(`Unhandled message type in VIP_ORDER_SERVICE_QUEUE: ${data.type}`)
      }
    }
  )
}