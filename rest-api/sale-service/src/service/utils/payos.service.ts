import { PayOS } from '@payos/node'
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
}

export default new PayosService()
