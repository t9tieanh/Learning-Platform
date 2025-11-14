export const QueueName = {
  REGISTER_SERVICE_QUEUE: 'register.service.queue',
  ORDER_SERVICE_QUEUE: 'order.service.queue',
  NOTIFICATION_SERVICE_QUEUE: 'notification.service.queue'
} as const

export type QueueNameKey = keyof typeof QueueName
