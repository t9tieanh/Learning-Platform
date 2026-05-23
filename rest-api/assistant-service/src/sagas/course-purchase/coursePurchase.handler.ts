import type { CoursePurchasedSyncPayload } from './dtos'
import userPurchasedCourseService from '~/service/models/userPurchasedCourse.service'
import Logger from '~/utils/logger'

class CoursePurchaseHandler {
  async handleCoursePurchasedSync(payload: CoursePurchasedSyncPayload): Promise<void> {
    try {
      await userPurchasedCourseService.syncFromOrder(payload)
    } catch (error) {
      Logger.error(`[CoursePurchaseHandler] Failed to sync purchased courses: ${error}`)
      throw error
    }
  }
}

export default new CoursePurchaseHandler()
