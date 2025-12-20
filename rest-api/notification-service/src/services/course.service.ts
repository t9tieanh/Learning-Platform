import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import nodemailService from '~/services/mails/nodemail.service'
import { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import { saveCourseToSupabase } from '~/utils/supabase'

export const handleCourseApprovalEvent = async (event: CourseApprovalEvent): Promise<void> => {
  try {
    await Promise.all([
      nodemailService.sendMail({
        ...event,
        type: QueueNameEnum.COURSE_APPROVAL
      }),
      saveCourseToSupabase(event.id, event.title, event.longDescription || '', event.tags?.map((tag) => tag.name) || [])
    ])
  } catch (err) {
    console.error('Lỗi gửi email course approval:', err)
  }
}
