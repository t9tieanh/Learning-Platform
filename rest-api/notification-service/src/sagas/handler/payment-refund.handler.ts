import nodeMailService from '~/services/mails/nodemail.service'
import { PaymentRefundNotification } from '~/dto/request/notification.dto'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import { NotificationOrderType } from '~/enums/notificationOrderType.enum'
import { PaymentRefundPayload } from '~/sagas/order/dtos'
import Logger from '~/utils/logger'

class PaymentRefundHandler {
  async handlePaymentRefund(message: PaymentRefundPayload) {
    try {
      Logger.info(`[PaymentRefundHandler] Refund notify for order ${message.orderId}`)

      const refundPayload = {
        customer_name: message.customer_name,
        customer_email: message.customer_email,
        total: message.total,
        orderId: message.orderId,
        user_id: message.user_id,
        orderType: message.orderType,
        reason: message.reason,
      }

      const isVip = message.orderType === NotificationOrderType.VIP
      const userTitle = isVip ? 'Đăng ký VIP Learnova không thành công' : 'Thông báo hoàn tiền'
      const adminTitle = isVip ? 'Cảnh báo đăng ký VIP thất bại' : 'Cảnh báo thanh toán thất bại'

      await Promise.all([
        nodeMailService.sendMail({
          type: QueueNameEnum.PAYMENT_REFUND,
          email: message.customer_email,
          title: userTitle,
          payload: refundPayload,
        } as PaymentRefundNotification),
        nodeMailService.sendMail({
          type: QueueNameEnum.PAYMENT_FAIL_ADMIN,
          title: adminTitle,
          payload: refundPayload,
        } as PaymentRefundNotification),
      ])
    } catch (error) {
      Logger.error(`Error handling payment refund notification: ${error}`)
    }
  }
}

export default new PaymentRefundHandler()
