import { createHash } from 'node:crypto'
import prismaService from '~/service/utils/prisma.service'
import Logger from '~/utils/logger'
import type { CoursePurchasedSyncPayload } from '~/sagas/course-purchase/dtos'

type PurchasedCourseRecord = {
  id: string
  userId: string
  courseId: string
  purchasedAt: Date
}

/** PostgreSQL bigint is signed int64; max positive value is 2^63 - 1. */
const PG_BIGINT_MAX = 0x7fffffffffffffffn

class UserPurchasedCourseService {
  /** Stable numeric id as string — cast to bigint in SQL (Prisma client cannot pass JS BigInt reliably). */
  private purchasedCourseId(userId: string, courseId: string): string {
    const hex = createHash('sha256')
      .update(`${userId}\0${courseId}`)
      .digest('hex')
      .slice(0, 16)
    const id = BigInt(`0x${hex}`) & PG_BIGINT_MAX
    return id.toString()
  }

  private async bulkUpsertPurchasedCourses(records: PurchasedCourseRecord[]): Promise<void> {
    await prismaService.$transaction(async (tx) => {
      for (const row of records) {
        await tx.$executeRawUnsafe(
          `INSERT INTO public.user_purchased_courses (id, user_id, course_id, purchased_at)
           VALUES ($1::bigint, $2::text, $3::text, $4::timestamp without time zone)
           ON CONFLICT (id) DO UPDATE SET purchased_at = EXCLUDED.purchased_at`,
          row.id,
          row.userId,
          row.courseId,
          row.purchasedAt
        )
      }
    })
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
