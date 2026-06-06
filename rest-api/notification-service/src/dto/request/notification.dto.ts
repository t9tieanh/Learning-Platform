import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import { NotificationPayload } from '~/sagas/order/dtos'

export interface NotificationDto {
  type: QueueNameEnum
  email?: string[] | string
  title: string
}

export interface VerifyEmail extends NotificationDto {
  token: string
  name: string
}

export interface OrderConfirm extends NotificationDto {
  payload: NotificationPayload
}

export interface PaymentRefundNotification extends NotificationDto {
  payload: {
    customer_name: string
    customer_email: string
    total: number
    orderId: string
    user_id?: string
  }
}
