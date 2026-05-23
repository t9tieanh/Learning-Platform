import nodemailer from 'nodemailer'
import { env } from '~/config/env'
import { NotificationDto, VerifyEmail } from '~/dto/request/notification.dto'
import { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import { getUser } from '~/grpc/userClient'
import { renderTemplate } from '~/utils/templateUtil'
import Logger from '~/utils/logger'

// Interface cho options gửi mail
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
}

class NodeMailService {
  static transporter: nodemailer.Transporter | null = null

  constructor() {
    if (NodeMailService.transporter === null) {
      NodeMailService.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: env.GMAIL_USER,
          pass: env.GMAIL_PASS
        }
      })
    }
  }

  private async send(options: SendEmailOptions): Promise<nodemailer.SentMessageInfo> {
    try {
      const info = await NodeMailService.transporter?.sendMail({
        from: '"Phạm Tiến Anh" <phama9162@gmail.com>',
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html
      })

      Logger.info(`Email sent: ${info.messageId}`)
      return info
    } catch (error) {
      Logger.error(`Failed to send email: ${error}`)
      throw error
    }
  }

  // public send mail
  async sendMail(notification: NotificationDto): Promise<void> {
    let subject = ''
    let to
    let templateName = ''
    let templateData = {}

    switch (notification.type) {
      case QueueNameEnum.VERIFY_EMAIL: {
        const emailNotification = notification as VerifyEmail

        subject = 'Hãy xác thực tài khoản của bạn'
        to = emailNotification.email
        templateName = 'email-verification.html'
        templateData = { name: emailNotification.name, token: emailNotification.token }
        break
      }

      case QueueNameEnum.RESET_PASSWORD: {
        const passwordNotification = notification as VerifyEmail

        subject = 'Đặt lại mật khẩu của bạn'
        to = passwordNotification.email
        templateName = 'email-verification.html'
        templateData = { name: passwordNotification.name, token: passwordNotification.token }
        break
      }

      case QueueNameEnum.ORDERCONFIRM: {
        Logger.info(`[NodeMailService] Handling ORDERCONFIRM. Processing for: ${(notification as any).payload?.customer_email || (notification as any).email}. isVip: ${(notification as any).payload?.orderType === 'VIP'}`);
        // Order confirmation notification - payload should contain customer and items
        const orderNotification = notification as {
          email?: string | string[]
          to?: string | string[]
          payload?: any
        }

        const isVipOrder = orderNotification.payload?.orderType === 'VIP'

        subject = isVipOrder ? 'Cảm ơn bạn đã đăng ký VIP!' : 'Xác nhận đơn hàng của bạn'
        to = orderNotification.email || orderNotification.to || []
        templateName = isVipOrder ? 'vip-confirmation.html' : 'order-confirmation.html'
        templateData = orderNotification.payload || orderNotification
        break
      }
      case QueueNameEnum.STUDY_REMINDER: {
        const reminder = notification as {
          email?: string
          userName?: string
          courses?: Array<{
            title: string
            courseUrl: string
            thumbnailUrl?: string
            progress?: number
          }>
        }

        subject = 'Đừng quên học hôm nay trên Learnova 🎓'
        to = reminder.email || notification.email
        templateName = 'study-reminder.html'
        templateData = {
          userName: reminder.userName || 'bạn',
          year: new Date().getFullYear(),
          courses: (reminder.courses || []).map((course) => {
            const progress =
              course.progress != null
                ? Math.min(100, Math.max(0, Math.round(course.progress)))
                : 0
            return {
              ...course,
              progress,
              progressRemaining: 100 - progress,
              progressLabel: course.progress != null ? `${progress}%` : 'Chưa bắt đầu',
              hasThumbnail: Boolean(course.thumbnailUrl)
            }
          })
        }
        break
      }
      case QueueNameEnum.COURSE_APPROVAL: {
        const event = notification as unknown as CourseApprovalEvent
        // Lấy email instructor qua userGrpc
        let instructorEmail = ''
        try {
          const user = await getUser(event.instructorId)
          instructorEmail = user?.email || ''
        } catch (err) {
          Logger.error(`Lỗi lấy email instructor: ${err}`)
          return
        }
        to = instructorEmail
        if (event.action === 'APPROVED') {
          subject = 'Khóa học của bạn đã được duyệt!'
          templateName = 'course-approved.html'
          templateData = {
            title: event.title,
            shortDescription: event.shortDescription,
            finalPrice: event.finalPrice,
            thumbnailUrl: event.thumbnailUrl
          }
        } else if (event.action === 'REJECTED') {
          subject = 'Khóa học của bạn bị từ chối'
          templateName = 'course-rejected.html'
          templateData = {
            title: event.title,
            reason: event.reason,
            thumbnailUrl: event.thumbnailUrl
          }
        } else {
          Logger.info(`Không xác định action cho course approval: ${JSON.stringify(event)}`)
          return
        }
        break
      }
      default:
        Logger.info(`Chưa thể gửi mail to ${notification.email}: ${notification.type}`)
        return
    }

    // render html
    const html = await renderTemplate(templateName, templateData)

    const mailPayload: SendEmailOptions = {
      to: (to as string[]) || [notification.email],
      subject,
      text: html.replace(/<[^>]+>/g, ''), // Convert HTML to plain text thô sơ
      html
    }

    await this.send(mailPayload)
    Logger.info(`Email sent: ${mailPayload.subject}`)
  }
}

export default new NodeMailService()
