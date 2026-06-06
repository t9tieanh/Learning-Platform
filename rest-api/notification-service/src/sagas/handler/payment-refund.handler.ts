import nodeMailService from '~/services/mails/nodemail.service'
import { PaymentRefundNotification } from '~/dto/request/notification.dto'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
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
      }

      await Promise.all([
        nodeMailService.sendMail({
          type: QueueNameEnum.PAYMENT_REFUND,
          email: message.customer_email,
          title: 'Thông báo hoàn tiền',
          payload: refundPayload,
        } as PaymentRefundNotification),
        nodeMailService.sendMail({
          type: QueueNameEnum.PAYMENT_FAIL_ADMIN,
          title: 'Cảnh báo thanh toán thất bại',
          payload: refundPayload,
        } as PaymentRefundNotification),
      ])
    } catch (error) {
      Logger.error(`Error handling payment refund notification: ${error}`)
    }
  }
}

export default new PaymentRefundHandler()
