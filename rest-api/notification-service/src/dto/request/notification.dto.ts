import { NotificationType } from '~/enums/notification.enum'

export interface NotificationDto {
  type: NotificationType
  email: string[]
  title: string
}

export interface VerifyEmail extends NotificationDto {
  token: string
}
