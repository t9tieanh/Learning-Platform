import nodemailer from 'nodemailer'
import { env } from '~/config/env'
import { NotificationDto, VerifyEmail } from '~/dto/request/notification.dto'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import { renderTemplate } from '~/utils/templateUtil'

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

      console.log('Email sent:', info.messageId)
      return info
    } catch (error) {
      console.error('Failed to send email:', error)
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
        // Order confirmation notification - payload should contain customer and items
        const orderNotification = notification as {
          email?: string | string[]
          to?: string | string[]
          payload?: unknown
        }

        subject = 'Xác nhận đơn hàng của bạn'
        to = orderNotification.email || orderNotification.to || []
        templateName = 'order-confirmation.html'
        templateData = orderNotification.payload || orderNotification
        break
      }
      // Thêm các loại khác nếu cần
      default:
        console.log(`Chưa thể gửi mail to ${notification.email}: ${notification.type}`)
        return
    }

    // render html
    const html = await renderTemplate(templateName, templateData)

    const mailPayload: SendEmailOptions = {
      to,
      subject,
      text: html.replace(/<[^>]+>/g, ''), // Convert HTML to plain text thô sơ
      html
    }

    await this.send(mailPayload)
  }
}

export default new NodeMailService()
