import nodemailer from 'nodemailer'
import { env } from '~/config/env'
import { NotificationDto, PaymentRefundNotification, VerifyEmail } from '~/dto/request/notification.dto'
import { CourseApprovalEvent } from '~/dto/event/course-approval-event.dto'
import { QueueNameEnum } from '~/enums/rabbitQueue.enum'
import { getUser } from '~/grpc/userClient'
import { EMAIL_GRADIENTS, renderTemplate } from '~/utils/templateUtil'
import Logger from '~/utils/logger'

function withEmailLayout(data: Record<string, unknown>): Record<string, unknown> {
  return {
    year: new Date().getFullYear(),
    headerGradient: EMAIL_GRADIENTS.brand,
    buttonGradient: EMAIL_GRADIENTS.brand,
    ...data
  }
}

// Interface cho options gửi mail
export interface SendEmailOptions {
  to: string | string[]
  subject: string
  text?: string
  html?: string
  attachments?: Array<{
    filename: string
    content: Buffer
    contentType?: string
  }>
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
        html: options.html,
        attachments: options.attachments
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
        templateData = withEmailLayout({
          pageTitle: 'Xác thực tài khoản · Learnova',
          badge: 'Xác thực',
          headerTitle: `Xin chào ${emailNotification.name}!`,
          headerSubtitle: 'Hoàn tất xác thực để bắt đầu học trên Learnova.',
          ctaUrl: emailNotification.token,
          ctaLabel: 'Xác thực tài khoản',
          footerNote: 'Email bảo mật tài khoản · Learnova',
          name: emailNotification.name,
          token: emailNotification.token,
          isPasswordReset: false
        })
        break
      }

      case QueueNameEnum.RESET_PASSWORD: {
        const passwordNotification = notification as VerifyEmail

        subject = 'Đặt lại mật khẩu của bạn'
        to = passwordNotification.email
        templateName = 'email-verification.html'
        templateData = withEmailLayout({
          pageTitle: 'Đặt lại mật khẩu · Learnova',
          badge: 'Bảo mật',
          headerTitle: `Xin chào ${passwordNotification.name}!`,
          headerSubtitle: 'Tạo mật khẩu mới cho tài khoản Learnova của bạn.',
          ctaUrl: passwordNotification.token,
          ctaLabel: 'Đặt lại mật khẩu',
          footerNote: 'Email bảo mật tài khoản · Learnova',
          name: passwordNotification.name,
          token: passwordNotification.token,
          isPasswordReset: true
        })
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
        const orderPayload = (orderNotification.payload || orderNotification) as Record<string, any>
        const orderTotal = Number(orderPayload.total)
        const formattedTotal = isNaN(orderTotal) ? orderPayload.total : orderTotal.toLocaleString('vi-VN')

        if (isVipOrder) {
          templateData = withEmailLayout({
            ...orderPayload,
            pageTitle: 'Đăng ký VIP · Learnova',
            badge: 'VIP',
            headerGradient: EMAIL_GRADIENTS.vip,
            buttonGradient: EMAIL_GRADIENTS.vip,
            headerTitle: `Cảm ơn ${orderPayload.customer_name || 'bạn'}!`,
            headerSubtitle: `Email: ${orderPayload.customer_email || ''} · Tổng ${formattedTotal} VND`,
            ctaUrl: orderPayload.order_url,
            ctaLabel: 'Trải nghiệm VIP ngay',
            footerNote: 'Xác nhận gói VIP · Learnova'
          })
        } else {
          templateData = withEmailLayout({
            ...orderPayload,
            pageTitle: 'Xác nhận đơn hàng · Learnova',
            badge: 'Đơn hàng',
            headerTitle: `Cảm ơn ${orderPayload.customer_name || 'bạn'}!`,
            headerSubtitle: `Email: ${orderPayload.customer_email || ''} · Tổng ${formattedTotal} VND`,
            ctaUrl: orderPayload.order_url,
            ctaLabel: 'Xem đơn hàng',
            footerNote: 'Xác nhận thanh toán · Learnova',
            items: (orderPayload.items || []).map((item: Record<string, unknown>) => ({
              ...item,
              hasThumbnail: Boolean(item.image)
            }))
          })
        }
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
        templateData = withEmailLayout({
          pageTitle: 'Nhắc học hôm nay · Learnova',
          badge: 'Nhắc học',
          headerTitle: `Chào ${reminder.userName || 'bạn'}, tiếp tục hành trình học tập nhé!`,
          headerSubtitle:
            'Bạn còn khóa học đang học dở — dành vài phút hôm nay để giữ nhịp và hoàn thành mục tiêu.',
          footerNote: 'Email nhắc học tự động mỗi ngày · Learnova',
          userName: reminder.userName || 'bạn',
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
        })
        break
      }
      case QueueNameEnum.CERTIFICATE_ISSUED: {
        const issued = notification as {
          email?: string
          userName?: string
          courseTitle?: string
          courseThumbnailUrl?: string | null
          certificateCode?: string
          courseScore?: number | null
          courseScoreTotal?: number | null
          profileUrl?: string
          courseUrl?: string
          certificatePdfBase64?: string | null
          certificatePdfFilename?: string | null
        }

        subject = 'Chúc mừng! Bạn đã nhận chứng chỉ hoàn thành khóa học 🎓'
        to = issued.email || notification.email
        templateName = 'certificate-issued.html'
        templateData = withEmailLayout({
          pageTitle: 'Chứng chỉ hoàn thành khóa học · Learnova',
          badge: 'Chứng chỉ',
          headerGradient: EMAIL_GRADIENTS.success,
          buttonGradient: EMAIL_GRADIENTS.brand,
          headerTitle: `Chúc mừng ${issued.userName || 'bạn'}!`,
          headerSubtitle: 'Bạn đã hoàn thành khóa học và nhận chứng chỉ từ Learnova.',
          ctaUrl: issued.profileUrl,
          ctaLabel: 'Xem chứng chỉ của tôi',
          footerNote: 'Thông báo chứng chỉ khóa học · Learnova',
          userName: issued.userName || 'bạn',
          courseTitle: issued.courseTitle || 'Khóa học',
          courseThumbnailUrl: issued.courseThumbnailUrl,
          hasThumbnail: Boolean(issued.courseThumbnailUrl),
          certificateCode: issued.certificateCode,
          courseScore: issued.courseScore,
          courseScoreTotal: issued.courseScoreTotal,
          hasCourseScore: issued.courseScore != null && issued.courseScoreTotal != null,
          scoreDisplay:
            issued.courseScore != null && issued.courseScoreTotal != null
              ? `${issued.courseScore}/${issued.courseScoreTotal}`
              : null,
          hasPdfAttachment: Boolean(issued.certificatePdfBase64),
          profileUrl: issued.profileUrl,
          courseUrl: issued.courseUrl
        })

        const html = await renderTemplate(templateName, templateData)

        const mailPayload: SendEmailOptions = {
          to: (to as string[]) || [notification.email],
          subject,
          text: html.replace(/<[^>]+>/g, ''),
          html
        }

        if (issued.certificatePdfBase64) {
          mailPayload.attachments = [
            {
              filename: issued.certificatePdfFilename || 'Learnova-Chung-chi.pdf',
              content: Buffer.from(issued.certificatePdfBase64, 'base64'),
              contentType: 'application/pdf'
            }
          ]
        }

        await this.send(mailPayload)
        Logger.info(`Email sent: ${mailPayload.subject}`)
        return
      }
      case QueueNameEnum.PAYMENT_REFUND: {
        const refundNotification = notification as PaymentRefundNotification
        const refundPayload = refundNotification.payload
        const formattedTotal = Number(refundPayload.total).toLocaleString('vi-VN')

        subject = 'Thông báo hoàn tiền đơn hàng Learnova'
        to = refundPayload.customer_email
        templateName = 'payment-refund.html'
        templateData = withEmailLayout({
          pageTitle: 'Thông báo hoàn tiền · Learnova',
          badge: 'Hoàn tiền',
          headerGradient: EMAIL_GRADIENTS.danger,
          headerTitle: `Xin chào ${refundPayload.customer_name || 'bạn'}!`,
          headerSubtitle: 'Chúng tôi đã nhận thanh toán của bạn nhưng chưa thể kích hoạt đơn hàng.',
          footerNote: 'Thông báo hoàn tiền · Learnova',
          customerName: refundPayload.customer_name,
          orderId: refundPayload.orderId,
          formattedTotal,
        })
        break
      }
      case QueueNameEnum.PAYMENT_FAIL_ADMIN: {
        const adminNotification = notification as PaymentRefundNotification
        const adminPayload = adminNotification.payload
        const formattedTotal = Number(adminPayload.total).toLocaleString('vi-VN')

        subject = `[Learnova] Thanh toán thất bại — cần hoàn tiền #${adminPayload.orderId}`
        to = env.ADMIN_EMAIL
        templateName = 'payment-fail-admin.html'
        templateData = withEmailLayout({
          pageTitle: 'Cảnh báo thanh toán · Learnova',
          badge: 'Cảnh báo',
          headerGradient: EMAIL_GRADIENTS.danger,
          headerTitle: 'Thanh toán thất bại — cần xử lý hoàn tiền',
          headerSubtitle: 'Khách đã thanh toán qua PayOS nhưng hệ thống không kích hoạt được đơn hàng.',
          footerNote: 'Thông báo admin · Learnova',
          orderId: adminPayload.orderId,
          customerName: adminPayload.customer_name,
          customerEmail: adminPayload.customer_email,
          userId: adminPayload.user_id || '—',
          formattedTotal,
        })
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
          templateData = withEmailLayout({
            pageTitle: 'Khóa học đã duyệt · Learnova',
            badge: 'Đã duyệt',
            headerGradient: EMAIL_GRADIENTS.success,
            headerTitle: 'Khóa học của bạn đã được duyệt!',
            headerSubtitle: 'Chúc mừng! Khóa học đã pass quy trình kiểm duyệt.',
            footerNote: 'Thông báo giảng viên · Learnova',
            title: event.title,
            shortDescription: event.shortDescription,
            finalPrice: event.finalPrice,
            thumbnailUrl: event.thumbnailUrl,
            hasThumbnail: Boolean(event.thumbnailUrl)
          })
        } else if (event.action === 'REJECTED') {
          subject = 'Khóa học của bạn bị từ chối'
          templateName = 'course-rejected.html'
          templateData = withEmailLayout({
            pageTitle: 'Khóa học bị từ chối · Learnova',
            badge: 'Từ chối',
            headerGradient: EMAIL_GRADIENTS.danger,
            headerTitle: 'Khóa học cần chỉnh sửa',
            headerSubtitle: 'Vui lòng xem lý do và cập nhật nội dung trước khi gửi lại.',
            footerNote: 'Thông báo giảng viên · Learnova',
            title: event.title,
            reason: event.reason,
            thumbnailUrl: event.thumbnailUrl,
            hasThumbnail: Boolean(event.thumbnailUrl)
          })
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
