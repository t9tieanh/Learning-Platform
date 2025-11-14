export const MessageType = {
  ORDER_CREATED: 'order.created.v1',
  REGISTER_UPDATED: 'register.updated.v1',
  REGISTER_UPDATE_FAILED: 'register.update.failed.v1',
  ORDER_COMPLETED: 'order.completed.v1',
  ORDER_COMPLETION_FAILED: 'order.completion.failed.v1',
  NOTIFICATION_SEND: 'notification.send.v1'
} as const

export type MessageTypeKey = keyof typeof MessageType

export const ExchangeNames = {
  APP_EVENTS: 'app_events'
} as const
