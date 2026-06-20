import { PayOS, Webhook } from '@payos/node'
import { OrderType } from '@prisma/client'
import { payosConfig } from '~/config/payment'
import ApiError from '~/middleware/ApiError'
import StatusCodes from 'http-status-codes'
import prismaService from '~/service/utils/prisma.service'
import Logger from '~/utils/logger'

export interface CreatePayosPaymentInput {
  amount: number
  orderId: string
  type?: string
}

export interface PayosReturnQuery {
  code?: string
  orderCode?: string
  status?: string
  cancel?: string
}

export class PayosService {
  private payosClient: PayOS | null = null

  private getPayosClient(): PayOS {
    if (!this.payosClient) {
      if (!payosConfig.clientId || !payosConfig.apiKey || !payosConfig.checksumKey) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'PayOS chưa được cấu hình (CLIENT_ID, API_KEY, CHECKSUM_KEY)')
      }
      this.payosClient = new PayOS({
        clientId: payosConfig.clientId,
        apiKey: payosConfig.apiKey,
        checksumKey: payosConfig.checksumKey,
      })
    }
    return this.payosClient
  }

  private generateOrderCode(): number {
    const suffix = Math.floor(Math.random() * 1000)
    return Number(`${Date.now()}${suffix}`.slice(-12))
  }

  private buildReturnUrls(type?: string) {
    let returnUrl = payosConfig.returnUrl
    let cancelUrl = payosConfig.cancelUrl
    if (type === OrderType.VIP_SUBSCRIPTION) {
      returnUrl = returnUrl.replace('/verify-order/', '/verify-vip-order/')
      cancelUrl = cancelUrl.replace('/cancel-order/', '/cancel-vip-order/')
    }
    return { returnUrl, cancelUrl }
  }

  private shortDescription(orderId: string): string {
    return `DH${orderId.replace(/\W/g, '').slice(-20)}`.slice(0, 25)
  }

  async createPayment(
    data: CreatePayosPaymentInput
  ): Promise<{ payUrl: string; deeplink: string; orderId: string }> {
    const { amount, orderId, type } = data
    const roundedAmount = Math.round(amount)

    if (!roundedAmount || roundedAmount <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Số tiền không hợp lệ')
    }

    const payos = this.getPayosClient()
    const orderCode = this.generateOrderCode()
    const { returnUrl, cancelUrl } = this.buildReturnUrls(type)

    const paymentLink = await payos.paymentRequests.create({
      orderCode,
      amount: roundedAmount,
      description: this.shortDescription(orderId),
      returnUrl,
      cancelUrl,
      items: [
        {
          name: 'Learnova order',
          quantity: 1,
          price: roundedAmount,
        },
      ],
    })

    await prismaService.order.update({
      where: { id: orderId },
      data: { payos_order_code: BigInt(orderCode) },
    })

    Logger.info(`PayOS link created orderId=${orderId} orderCode=${orderCode}`)

    return {
      payUrl: paymentLink.checkoutUrl,
      deeplink: '',
      orderId,
    }
  }

  async verifyReturnQuery(query: PayosReturnQuery): Promise<{
    orderId: string
    amount: number
    orderCode: number
  }> {
    const orderCode = Number(query.orderCode)
    if (!orderCode || Number.isNaN(orderCode)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'orderCode không hợp lệ')
    }

    const isCancelled =
      query.cancel === 'true' || query.status === 'CANCELLED' || query.code === '01'
    if (isCancelled) {
      throw new ApiError(StatusCodes.PAYMENT_REQUIRED, 'Thanh toán đã bị hủy')
    }

    const payos = this.getPayosClient()
    const paymentLink = await payos.paymentRequests.get(orderCode)

    if (paymentLink.status !== 'PAID') {
      throw new ApiError(
        StatusCodes.PAYMENT_REQUIRED,
        `Thanh toán chưa hoàn tất (trạng thái: ${paymentLink.status})`
      )
    }

    const order = await prismaService.order.findFirst({
      where: { payos_order_code: BigInt(orderCode) },
      select: { id: true, total: true },
    })

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng cho mã PayOS')
    }

    if (Math.round(order.total) !== paymentLink.amount) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Số tiền không khớp với đơn hàng')
    }

    return {
      orderId: order.id,
      amount: paymentLink.amount,
      orderCode,
    }
  }

  async verifyWebhook(body: Webhook): Promise<{ orderCode: number; amount: number }> {
    const payos = this.getPayosClient()
    let webhookData
    try {
      webhookData = await payos.webhooks.verify(body)
    } catch (err) {
      Logger.warn(`PayOS webhook verify failed: ${err}`)
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Chữ ký webhook không hợp lệ')
    }

    if (!webhookData || webhookData.code !== '00') {
      throw new ApiError(StatusCodes.PAYMENT_REQUIRED, 'Thanh toán chưa thành công')
    }

    return {
      orderCode: webhookData.orderCode,
      amount: webhookData.amount,
    }
  }

  async resolveOrderFromWebhook(data: { orderCode: number; amount: number }) {
    const order = await prismaService.order.findFirst({
      where: { payos_order_code: BigInt(data.orderCode) },
      select: {
        id: true,
        total: true,
        type: true,
        status: true,
        user_id: true,
        customer_email: true,
        customer_name: true,
        items: { select: { course_id: true, price: true } },
      },
    })

    if (!order) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy đơn hàng cho mã PayOS')
    }

    if (Math.round(order.total) !== data.amount) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Số tiền không khớp với đơn hàng')
    }

    return { orderId: order.id, amount: data.amount, order }
  }

  async confirmWebhook(): Promise<void> {
    if (!payosConfig.webhookUrl) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'PAYOS_WEBHOOK_URL chưa được cấu hình')
    }

    const payos = this.getPayosClient()
    await payos.webhooks.confirm(payosConfig.webhookUrl)
    Logger.info(`PayOS webhook registered: ${payosConfig.webhookUrl}`)
  }

  /** Retry webhook registration with linear backoff: 5s → 10s → 20s between attempts. */
  async confirmWebhookWithRetry(retryDelaysMs: number[] = [5000, 10000, 20000]): Promise<void> {
    const maxAttempts = retryDelaysMs.length + 1

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await this.confirmWebhook()
        if (attempt > 1) {
          Logger.info(`PayOS webhook registered on attempt ${attempt}/${maxAttempts}`)
        }
        return
      } catch (err) {
        const isLastAttempt = attempt === maxAttempts
        if (isLastAttempt) {
          throw err
        }

        const delayMs = retryDelaysMs[attempt - 1]
        Logger.warn(
          `PayOS webhook confirm failed (attempt ${attempt}/${maxAttempts}): ${err}. Retrying in ${delayMs / 1000}s...`
        )
        await new Promise((resolve) => setTimeout(resolve, delayMs))
      }
    }
  }
}

export default new PayosService()
