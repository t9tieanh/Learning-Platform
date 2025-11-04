import { QueueNameEnum } from '../../enums/emailType.enum'

export interface NotificationDto {
  type: QueueNameEnum
  email: string[]
  title: string
}

// Tạo interface cho order confirmation data
export interface OrderConfirmationData extends NotificationDto {
  orderId: string
  customerName: string
  orderDate: string
  totalAmount: number
  items: Array<{
    productName: string
    quantity: number
  }>
}