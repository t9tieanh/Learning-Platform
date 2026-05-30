import type { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import courseEmbeddingService from '~/service/models/courseEmbedding.service'
import Logger from '~/utils/logger'

class CourseApprovalService {
  async handleCourseApprovalEvent(event: CourseApprovalEvent): Promise<void> {
    try {
      await courseEmbeddingService.indexFromApprovalEvent(event)
    } catch (error) {
      Logger.error(`[CourseApprovalService] Failed to index course ${event.id}: ${error}`)
      throw error
    }
  }
}

export default new CourseApprovalService()
