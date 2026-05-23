export const CourseQueueName = {
    REGISTER_SERVICE_QUEUE: 'register.service.queue',
    ORDER_SERVICE_QUEUE: 'order.service.queue',
    NOTIFICATION_SERVICE_QUEUE: 'notification.service.queue.dev',
    ASSISTANT_COURSE_PURCHASE_QUEUE: 'assistant.course.purchase.queue'
} as const

export type CourseQueueNameKey = keyof typeof CourseQueueName
