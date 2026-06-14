import { OrderStatus } from '@prisma/client'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/middleware/ApiError'
import { createEnvelope } from '~/sagas/events/envelope'
import { OrderCreatedPayload } from '~/sagas/order_course/course.dtos'
import { CourseMessageType } from '~/sagas/order_course/course.events'
import prismaService from '~/service/utils/prisma.service'
import rabbitMQService from '~/service/utils/rabbitmq.service'
import redisService from '~/service/utils/redis.service'
import Logger from '~/utils/logger'

const SAGA_TRIGGERED_TTL_SEC = 24 * 60 * 60

export type FulfillmentSource = 'return_url' | 'webhook'

export interface SagaTriggeredMeta {
  triggeredAt: string
  source: FulfillmentSource
  correlationId: string
}

export interface TriggerFulfillmentResult {
  triggered: boolean
  alreadyExisted?: boolean
  reason?: 'cancelled' | 'publish_failed' | 'order_not_found'
}

const sagaTriggeredKey = (orderId: string) => `order:saga:triggered:${orderId}`
const sagaTriggeredChannel = (orderId: string) => `saga:triggered:${orderId}`

class OrderFulfillmentService {
  async isSagaTriggered(orderId: string): Promise<boolean> {
    return redisService.exists(sagaTriggeredKey(orderId))
  }

  async markSagaTriggered(
    orderId: string,
    meta: { source: FulfillmentSource; correlationId: string; triggeredAt?: string }
  ): Promise<boolean> {
    const payload: SagaTriggeredMeta = {
      triggeredAt: meta.triggeredAt ?? new Date().toISOString(),
      source: meta.source,
      correlationId: meta.correlationId,
    }

    const acquired = await redisService.setLock(sagaTriggeredKey(orderId), payload, SAGA_TRIGGERED_TTL_SEC)
    if (!acquired) {
      return false
    }

    await redisService.publish(sagaTriggeredChannel(orderId), { orderId, ...payload })
    Logger.info(`Saga triggered signal set for order ${orderId} (source=${meta.source})`)
    return true
  }

  async triggerOrderFulfillment(orderId: string, source: FulfillmentSource): Promise<TriggerFulfillmentResult> {
    if (await this.isSagaTriggered(orderId)) {
      return { triggered: true, alreadyExisted: true }
    }

    const order = await prismaService.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!order) {
      return { triggered: false, reason: 'order_not_found' }
    }

    if (order.status === OrderStatus.Completed) {
      return { triggered: true, alreadyExisted: true }
    }

    if (order.status === OrderStatus.Cancel) {
      return { triggered: false, reason: 'cancelled' }
    }

    const lockKey = `payment:lock:${orderId}`
    let locked = Boolean(await redisService.setLock(lockKey, { source }, 120))

    if (!locked) {
      if (await this.isSagaTriggered(orderId)) {
        return { triggered: true, alreadyExisted: true }
      }
      locked = await redisService.tryLockWithRetry(lockKey, { source }, 120, 5, 300)
      if (!locked) {
        if (await this.isSagaTriggered(orderId)) {
          return { triggered: true, alreadyExisted: true }
        }
        throw new ApiError(StatusCodes.CONFLICT, 'Đơn hàng đang được xử lý')
      }
    }

    if (await this.isSagaTriggered(orderId)) {
      return { triggered: true, alreadyExisted: true }
    }

    await prismaService.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.Processing },
    })

    const correlationId = `order-${orderId}`
    const payload: OrderCreatedPayload = {
      orderId: order.id,
      userId: order.user_id,
      amount: order.total,
      items: order.items.map((item) => ({ course_id: item.course_id, price: item.price })),
    }

    const envelope = createEnvelope({
      type: CourseMessageType.ORDER_CREATED,
      payload,
      correlationId,
    })

    Logger.info(`Publishing ORDER_CREATED (source=${source}): ${JSON.stringify(envelope)}`)

    try {
      await rabbitMQService.sendMessageTopic(
        envelope,
        'app_events',
        CourseMessageType.ORDER_CREATED,
        'topic',
        true
      )
    } catch (err) {
      Logger.error(`Publish ORDER_CREATED failed (source=${source}): ${err}`)
      return { triggered: false, reason: 'publish_failed' }
    }

    await this.markSagaTriggered(orderId, { source, correlationId })

    return { triggered: true, alreadyExisted: false }
  }
}

export default new OrderFulfillmentService()
