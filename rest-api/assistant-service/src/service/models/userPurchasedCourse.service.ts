import { createHash } from 'node:crypto'
import { Prisma } from '@prisma/client'
import prismaService from '~/service/utils/prisma.service'
import Logger from '~/utils/logger'
import type { CoursePurchasedSyncPayload } from '~/sagas/course-purchase/dtos'

type PurchasedCourseRecord = {
  id: bigint
  userId: string
  courseId: string
  purchasedAt: Date
}

class UserPurchasedCourseService {
  private purchasedCourseId(userId: string, courseId: string): bigint {
    const hex = createHash('sha256')
      .update(`${userId}\0${courseId}`)
      .digest('hex')
      .slice(0, 16)
    return BigInt(`0x${hex}`)
  }

  private async bulkUpsertPurchasedCourses(records: PurchasedCourseRecord[]): Promise<void> {
    const values = Prisma.join(
      records.map(
        (row) =>
          Prisma.sql`(${row.id}, ${row.userId}, ${row.courseId}, ${row.purchasedAt})`
      )
    )

    await prismaService.$executeRaw`
      INSERT INTO user_purchased_courses (id, user_id, course_id, purchased_at)
      VALUES ${values}
      ON CONFLICT (id) DO UPDATE SET purchased_at = EXCLUDED.purchased_at
    `
  }

  async syncFromOrder(payload: CoursePurchasedSyncPayload): Promise<void> {
    const { user_id: userId, order_id: orderId, items } = payload

    if (!items?.length) {
      Logger.warn(`[UserPurchasedCourse] No items in payload for order ${orderId}`)
      return
    }

    const purchasedAt = new Date()
    const records = items
      .filter((item) => item.course_id)
      .map((item) => ({
        id: this.purchasedCourseId(userId, item.course_id),
        userId,
        courseId: item.course_id,
        purchasedAt
      }))

    if (!records.length) {
      Logger.warn(`[UserPurchasedCourse] No valid course ids for order ${orderId}`)
      return
    }

    await this.bulkUpsertPurchasedCourses(records)

    Logger.info(
      `[UserPurchasedCourse] Synced ${records.length} course(s) for user ${userId}, order ${orderId}`
    )
  }
}

export default new UserPurchasedCourseService()
