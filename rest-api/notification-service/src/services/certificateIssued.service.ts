import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import nodemailService from '~/services/mails/nodemail.service'
import type { CertificateIssuedEvent } from '~/dto/event/certificate-issued-event.dto'
import Logger from '~/utils/logger'

export const handleCertificateIssuedEvent = async (event: CertificateIssuedEvent): Promise<void> => {
  if (!event?.email) {
    Logger.warn('[CertificateIssued] Skip invalid payload — missing email')
    return
  }

  await nodemailService.sendMail({
    type: QueueNameEnum.CERTIFICATE_ISSUED,
    email: event.email,
    title: 'Chúc mừng! Bạn đã nhận chứng chỉ hoàn thành khóa học',
    userName: event.userName,
    courseTitle: event.courseTitle,
    courseThumbnailUrl: event.courseThumbnailUrl,
    certificateCode: event.certificateCode,
    profileUrl: event.profileUrl,
    courseUrl: event.courseUrl
  } as any)
}
