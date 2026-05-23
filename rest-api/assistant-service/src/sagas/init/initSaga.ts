import RabbitClient from '~/service/utils/rabbitmq.service'
import { EventEnvelope } from '~/sagas/events/envelope'
import { CoursePurchaseMessageType } from '~/sagas/course-purchase/events'
import { CoursePurchaseQueueName } from '~/sagas/course-purchase/queues'
import coursePurchaseHandler from '~/sagas/course-purchase/coursePurchase.handler'
import type { CoursePurchasedSyncPayload } from '~/sagas/course-purchase/dtos'
import { CourseApprovalExchangeName, CourseApprovalQueueName } from '~/sagas/course-approval/queues'
import courseApprovalService from '~/service/course-approval/courseApproval.service'
import type { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import Logger from '~/utils/logger'

export async function initSagas(): Promise<void> {
  await RabbitClient.getInstance()

  await RabbitClient.bindQueueToExchange(
    CourseApprovalQueueName.ASSISTANT_COURSE_EMBEDDING_QUEUE,
    CourseApprovalExchangeName.COURSE_APPROVAL,
    'course.approval.#',
    'topic'
  )

  await RabbitClient.registerConsumer<CourseApprovalEvent>(
    CourseApprovalQueueName.ASSISTANT_COURSE_EMBEDDING_QUEUE,
    CourseApprovalExchangeName.COURSE_APPROVAL,
    'course.approval.#',
    async (parsed) => {
      const event = parsed as CourseApprovalEvent
      if (!event?.id || !event?.action) {
        throw new Error('Invalid course approval event payload')
      }

      Logger.info(
        `[ASSISTANT_COURSE_EMBEDDING_QUEUE] received approval event for course ${event.id} (${event.action})`
      )
      await courseApprovalService.handleCourseApprovalEvent(event)
    }
  )

  await RabbitClient.bindQueueToExchange(
    CoursePurchaseQueueName.ASSISTANT_COURSE_PURCHASE_QUEUE,
    'app_events',
    'course.purchased.#',
    'topic'
  )

  await RabbitClient.registerConsumer<CoursePurchasedSyncPayload>(
    CoursePurchaseQueueName.ASSISTANT_COURSE_PURCHASE_QUEUE,
    'app_events',
    CoursePurchaseMessageType.COURSE_PURCHASED_SYNC,
    async (parsed) => {
      const data = parsed as EventEnvelope<CoursePurchasedSyncPayload>
      if (!data.payload?.user_id || !data.payload?.order_id) {
        throw new Error(`Invalid payload for event ${data.type}`)
      }

      Logger.info(`[ASSISTANT_COURSE_PURCHASE_QUEUE] received ${data.type}`)
      await coursePurchaseHandler.handleCoursePurchasedSync(data.payload)
    }
  )
}
