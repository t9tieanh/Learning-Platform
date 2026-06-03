export enum QueueNameEnum {
  /** Must match user-service RabbitMQConfig.VERIFY_REGISTER_QUEUE */
  VERIFY_EMAIL = 'register-user-queue',
  RESET_PASSWORD = 'forgot-password-queue',
  ORDERCONFIRM = 'order-confirm',
  COURSE_APPROVAL = 'course.approval.queue',
  STUDY_REMINDER = 'study-reminder.queue',
  CERTIFICATE_ISSUED = 'certificate-issued.queue'
}
