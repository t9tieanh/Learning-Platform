import nodemailer from 'nodemailer'
import { env } from '~/config/env'
import { NotificationDto, VerifyEmail } from '~/dto/request/notification.dto'
import { NotificationType } from '~/enums/notification.enum'
import { renderTemplate } from '~/utils/templateUtil'

// Interface cho options gửi mail
export interface SendEmailOptions {
  to: string[]
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
    const to = []
    let templateName = ''
    let templateData = {}

    switch (notification.type) {
      case NotificationType.VERIFY_EMAIL: {
        const emailNotification = notification as VerifyEmail

        subject = 'Hãy xác thực tài khoản của bạn'
        to.push(...emailNotification.email)
        templateName = 'email-verification.html'
        templateData = { name: emailNotification.title, token: emailNotification.token }
        break
      }

      // Thêm các loại khác nếu cần
      default:
        console.log(`Chưa thể gửi mail to ${notification.email}: ${notification.type}`)
        return
    }

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
