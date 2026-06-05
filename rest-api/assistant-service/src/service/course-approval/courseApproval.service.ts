import type { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import { CourseApprovalAction } from '~/enums/courseApprovalAction.enum'
import courseEmbeddingService from '~/service/models/courseEmbedding.service'
import Logger from '~/utils/logger'

class CourseApprovalService {
  async handleCourseApprovalEvent(event: CourseApprovalEvent): Promise<void> {
    if (event.action === CourseApprovalAction.REJECTED) {
      try {
        await courseEmbeddingService.deleteFromApprovalEvent(event)
      } catch (error) {
        Logger.warn(
          `[CourseApprovalService] Failed to delete embedding for rejected course ${event.id}: ${error}`
        )
      }
      return
    }

    if (event.action !== CourseApprovalAction.APPROVED) {
      Logger.warn(`[CourseApprovalService] Unsupported action ${event.action} for course ${event.id}`)
      return
    }

    try {
      await courseEmbeddingService.indexFromApprovalEvent(event)
    } catch (error) {
      Logger.error(`[CourseApprovalService] Failed to index course ${event.id}: ${error}`)
      throw error
    }
  }
}

export default new CourseApprovalService()
