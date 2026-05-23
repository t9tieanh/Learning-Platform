import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import nodemailService from '~/services/mails/nodemail.service'
import type { StudyReminderEvent } from '~/dto/event/study-reminder-event.dto'
import Logger from '~/utils/logger'

export const handleStudyReminderEvent = async (event: StudyReminderEvent): Promise<void> => {
  if (!event?.email || !event.courses?.length) {
    Logger.warn('[StudyReminder] Skip invalid payload')
    return
  }

  await nodemailService.sendMail({
    type: QueueNameEnum.STUDY_REMINDER,
    email: event.email,
    title: 'Nhắc học hôm nay',
    userName: event.userName,
    courses: event.courses
  } as any)
}
