/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'crypto'
import { vnpayConfig } from '../../config/payment'
import ApiError from '../../middleware/ApiError'
import StatusCodes from 'http-status-codes'

export class VnpayService {
  // Validate VnPay config
  private validateConfig(): void {
    if (!vnpayConfig.vnp_TmnCode) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'VnPay TMN Code không được thiết lập')
    }

    if (!vnpayConfig.vnp_HashSecret) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'VnPay Hash Secret không được thiết lập')
    }

    if (vnpayConfig.vnp_HashSecret.length !== 32) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `VnPay Hash Secret phải có độ dài 32 ký tự, hiện tại: ${vnpayConfig.vnp_HashSecret.length}`)
    }
  }

  // Validate input data
  private validatePaymentInput(data: {
    amount: number
    orderId: string
    ipAddr?: string
  }): void {
    const { amount, orderId } = data

    if (!amount || amount <= 0) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Số tiền không hợp lệ hoặc phải lớn hơn 0')
    }

    if (!orderId || orderId.trim() === '') {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Mã đơn hàng không được để trống')
    }

    if (orderId.length > 34) {
      throw new ApiError(StatusCodes.BAD_REQUEST, `Mã đơn hàng quá dài (max 34 ký tự), hiện tại: ${orderId.length}`)
    }
  }

  // Sort object method
  private sortObject(obj: Record<string, any>): Record<string, string> {
    return Object.keys(obj)
      .sort()
      .reduce(
        (acc, key) => {
          if (obj[key] !== '' && obj[key] !== null && obj[key] !== undefined) {
            acc[key] = obj[key]
          }
          return acc
        },
        {} as { [key: string]: string }
      )
  }

  // Tạo secure hash
  private createSecureHash(queryString: string): string {
    const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret)
    return hmac.update(Buffer.from(queryString, 'utf-8')).digest('hex')
  }

  // create payment uri
  public async createPayment(data: {
    amount: number
    orderId: string
    ipAddr?: string
  }): Promise<{ payUrl: string; deeplink: string; orderId: string }> {
    try {
      // Validate config and input
      this.validateConfig()
      this.validatePaymentInput(data)

      const { amount, orderId, ipAddr } = data

      // Generate create date & expire date
      const { default: dateFormat } = await import('dateformat')
      const date = new Date()
      const createDate = dateFormat(date, 'yyyymmddHHmmss')

      // Expiration time 60 minutes
      const expireDate = dateFormat(new Date(date.getTime() + 60 * 60 * 1000), 'yyyymmddHHmmss')

      // Create VnPay parameters
      const vnp_Params: { [key: string]: string } = {
        vnp_Version: '2.1.0',
        vnp_Command: 'pay',
        vnp_TmnCode: vnpayConfig.vnp_TmnCode,
        vnp_Amount: Math.round(amount * 100).toString(),
        vnp_CreateDate: createDate,
        vnp_CurrCode: 'VND',
        vnp_IpAddr: ipAddr || '127.0.0.1',
        vnp_Locale: 'vn',
        vnp_OrderInfo: `Thanh toan don hang ${orderId}`,
        vnp_OrderType: 'other',
        vnp_ReturnUrl: vnpayConfig.vnp_redirectUrl,
        vnp_ExpireDate: expireDate,
        vnp_TxnRef: orderId
      }

      // Sort params
      const sortedParams = this.sortObject(vnp_Params)

      // Create query string
      const queryString = new URLSearchParams(sortedParams).toString()

      // Create secure hash
      const secureHash = this.createSecureHash(queryString)

      // Create payment URL
      const payUrl = `${vnpayConfig.vnp_Url}?${queryString}&vnp_SecureHash=${secureHash}`

      return {
        payUrl,
        deeplink: '',
        orderId
      }
    } catch (error: any) {
      throw new ApiError(error.status || StatusCodes.OK, error.message || `Tạo thanh toán VnPay thất bại: ${error.message}`)
    }
  }

  public getCallbackInfo(query: any) {
    // Validate config
    this.validateConfig()

    let vnp_Params = { ...query }
    const secureHash = vnp_Params['vnp_SecureHash']

    const orderId = vnp_Params['vnp_TxnRef']
    const rspCode = vnp_Params['vnp_ResponseCode']

    delete vnp_Params['vnp_SecureHash']
    delete vnp_Params['vnp_SecureHashType']

    vnp_Params = this.sortObject(vnp_Params)

    const secretKey = vnpayConfig.vnp_HashSecret
    const signData = new URLSearchParams(vnp_Params).toString()
    const hmac = crypto.createHmac('sha512', secretKey)
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

    const isValid = secureHash === signed
    return {
      orderId,
      amount: vnp_Params['vnp_Amount'],
      status: rspCode,
      isValid
    }
  }
}

export default new VnpayService()
