export interface OrderItemDto {
  course_id: string
  price: number
}

export interface OrderCreatedPayload {
  correlationId?: string
  orderId: string
  userId: string
  amount: number
  items: OrderItemDto[]
}

export interface RegisterUpdatedPayload {
  orderId: string
}

export interface OrderCompletedPayload {
  correlationId?: string
  orderId: string
}

export interface NotificationPayload {
  orderId: string
  to: string
  subject: string
  body: string
}
