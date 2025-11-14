import { NotificationPayload } from '../order/dtos'
import nodeMailService from '~/services/mails/nodemail.service'
import { OrderConfirm } from '~/dto/request/notification.dto'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'

class NotificationHandler {
  // Process when receiving event register.created.v1 -> save order with status Completed
  async handleSendEmailConfirm(message: NotificationPayload) {
    try {
      const notification = {
        type: QueueNameEnum.ORDERCONFIRM,
        email: message.customer_email,
        title: 'Xác nhận đơn hàng',
        payload: message
      } as OrderConfirm
      await nodeMailService.sendMail(notification)
    } catch (error) {
      console.error('Error handling order created notification:', error)
    }
  }
}

export default new NotificationHandler()
