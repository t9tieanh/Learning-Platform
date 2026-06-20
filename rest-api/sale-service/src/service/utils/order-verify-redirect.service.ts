import { Request, Response } from 'express'
import { env } from '~/config/env'
import { PaymentProviderEnum } from '~/enums/paymentProvider.enum'
import prismaService from '~/service/utils/prisma.service'

export interface VerifyRedirectResult {
  isSuccess: boolean
  orderId: string
}

class OrderVerifyRedirectService {
  redirectCheckoutOrder(res: Response, orderId?: string) {
    if (orderId) {
      return res.redirect(env.WEB_URL + orderId)
    }
    return res.redirect(env.WEB_URL)
  }

  async resolveOrderIdFromQuery(
    query: Request['query'],
    provider: PaymentProviderEnum
  ): Promise<string> {
    if (provider === PaymentProviderEnum.VNPAY) {
      return String(query.vnp_TxnRef || '')
    }

    if (provider === PaymentProviderEnum.MOMO) {
      return String(query.orderId || '')
    }

    if (provider !== PaymentProviderEnum.PAYOS) {
      return ''
    }

    const orderCode = Number(query.orderCode)
    if (!orderCode || Number.isNaN(orderCode)) {
      return ''
    }

    const order = await prismaService.order.findFirst({
      where: { payos_order_code: BigInt(orderCode) },
      select: { id: true },
    })

    return order?.id || ''
  }

  async handleVerifyRedirect(
    res: Response,
    query: Request['query'],
    provider: PaymentProviderEnum,
    verify: () => Promise<VerifyRedirectResult>
  ) {
    try {
      const result = await verify()
      const orderId =
        result.orderId || (await this.resolveOrderIdFromQuery(query, provider))
      return this.redirectCheckoutOrder(res, orderId)
    } catch {
      const orderId = await this.resolveOrderIdFromQuery(query, provider)
      return this.redirectCheckoutOrder(res, orderId)
    }
  }
}

export default new OrderVerifyRedirectService()
