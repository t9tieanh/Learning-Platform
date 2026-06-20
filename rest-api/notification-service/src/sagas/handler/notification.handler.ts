import { NotificationPayload } from '../order/dtos'
import nodeMailService from '~/services/mails/nodemail.service'
import { OrderConfirm } from '~/dto/request/notification.dto'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import chatService from '~/services/chat.service'
import Logger from '~/utils/logger'


class NotificationHandler {
  async handleSendEmailConfirm(message: NotificationPayload) {
    try {
      Logger.info(`[NotificationHandler] Received email confirmation for ${message.customer_email}. Items: ${message.items?.length}. Type: ${(message as any).orderType}`);

      const notification = {
        type: QueueNameEnum.ORDERCONFIRM,
        email: message.customer_email,
        title: 'Xác nhận đơn hàng',
        payload: message
      } as OrderConfirm

      await Promise.all([
        nodeMailService.sendMail(notification),
        ...(message.items || []).map((item) =>
          chatService.sendFirstMessage({
            courseId: item.course_id,
            courseName: item.course_name,
            studentId: message.user_id,
            instructorIdHint: item.instructor_id
          })
        ),
      ])
    } catch (error) {
      Logger.error(`Error handling order created notification: ${error}`)
    }
  }
}

export default new NotificationHandler()
