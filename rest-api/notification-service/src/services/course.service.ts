import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import nodemailService from '~/services/mails/nodemail.service'
import { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import Logger from '~/utils/logger'

export const handleCourseApprovalEvent = async (event: CourseApprovalEvent): Promise<void> => {
  try {
    await Promise.all([
      nodemailService.sendMail({
        ...event,
        type: QueueNameEnum.COURSE_APPROVAL
      })
    ])
  } catch (err) {
    Logger.error(`Lỗi gửi email course approval: ${err}`)
  }
}
