import { momoConfig } from '~/config/payment'
import axios from 'axios'
import crypto from 'crypto'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/middleware/ApiError'
// import prisma from '~/prisma.service'

// DTO
export interface CreatePaymentInput {
  amount: number
  orderId: string
  ipAddr?: string
}

export interface PaymentVerifyResult {
  isSuccess: boolean
  orderId: string
  rawData: any
  message?: string
  rspCode?: string
  amount?: number
  resultCode?: string
  transId?: string
  payType?: string
  responseTime?: string
  signatureValid?: boolean
}

export class MomoService {
  private axiosInstance = axios.create({
    baseURL: momoConfig.apiEndpoint,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Accept: 'application/json'
    }
  })

  private generateSignature(params: any): string {
    // Create raw signature theo forrmat momo
    const rawSignature =
      'accessKey=' +
      momoConfig.accessKey +
      '&amount=' +
      params.amount +
      '&extraData=' +
      params.extraData +
      '&ipnUrl=' +
      params.ipnUrl +
      '&orderId=' +
      params.orderId +
      '&orderInfo=' +
      params.orderInfo +
      '&partnerCode=' +
      params.partnerCode +
      '&redirectUrl=' +
      params.redirectUrl +
      '&requestId=' +
      params.requestId +
      '&requestType=' +
      params.requestType

    // console.log('--------------------RAW SIGNATURE----------------')
    // console.log(rawSignature)

    // Tạo signature bằng HMAC SHA256
    return crypto.createHmac('sha256', momoConfig.secretKey).update(rawSignature).digest('hex')
  }

  async createPayment(
    data: CreatePaymentInput
  ): Promise<{ payUrl: string; deeplink: string; orderId: string }> {
    const { amount, orderId } = data
    const requestId = orderId

    // Determine redirect URL based on platform
    const redirectUrl = momoConfig.redirectUrl

    // Parameters
    const params = {
      partnerCode: momoConfig.partnerCode,
      partnerName: momoConfig.partnerName,
      storeId: 'Test',
      requestId: requestId,
      amount: amount,
      orderId: orderId,
      orderInfo: `Thanh toán đơn hàng ${orderId}`,
      redirectUrl: redirectUrl,
      ipnUrl: momoConfig.ipnUrl,
      lang: 'vi',
      requestType: 'captureWallet',
      autoCapture: true,
      extraData: '',
      orderGroupId: ''
    }

    const signature = this.generateSignature(params)

    // Request body
    const requestBody = {
      partnerCode: params.partnerCode,
      partnerName: params.partnerName,
      storeId: params.storeId,
      requestId: params.requestId,
      amount: params.amount,
      orderId: params.orderId,
      orderInfo: params.orderInfo,
      redirectUrl: params.redirectUrl,
      ipnUrl: params.ipnUrl,
      lang: 'vi',
      requestType: 'captureWallet',
      autoCapture: true,
      extraData: '',
      orderGroupId: '',
      signature: signature
    }

    const response = await this.axiosInstance.post('/v2/gateway/api/create', requestBody)
    // console.log(response.data);

    if (response.data.resultCode === 0) {
      return {
        payUrl: response.data.payUrl,
        deeplink: response.data.deeplink,
        orderId: params.orderId
      }
    } else {
      throw new ApiError(200, response.data.message)
    }
  }

  async verifyCallback(query: any): Promise<PaymentVerifyResult> {
    try {
      const {
        orderId,
        amount,
        resultCode,
        message,
        payType,
        responseTime,
        transId,
        signature,
        extraData,
        orderInfo,
        requestId,
        orderType
      } = query

      // Verify signature để đảm bảo callback từ MoMo
      const rawSignature =
        'accessKey=' +
        momoConfig.accessKey +
        '&amount=' +
        amount +
        '&extraData=' +
        extraData +
        '&message=' +
        message +
        '&orderId=' +
        orderId +
        '&orderInfo=' +
        orderInfo +
        '&orderType=' +
        orderType +
        '&partnerCode=' +
        momoConfig.partnerCode +
        '&payType=' +
        payType +
        '&requestId=' +
        requestId +
        '&responseTime=' +
        responseTime +
        '&resultCode=' +
        resultCode +
        '&transId=' +
        transId

      const expectedSignature = crypto.createHmac('sha256', momoConfig.secretKey).update(rawSignature).digest('hex')

      const signatureValid = signature === expectedSignature

      if (!signatureValid) {
        return {
          isSuccess: false,
          orderId: orderId || '',
          rawData: query,
          message: 'Invalid signature',
          rspCode: '97',
          signatureValid
        }
      }

      // signature is valid - return parsed info so caller (service) can handle DB updates
      const numericAmount = Number(amount)
      if (resultCode === '0') {
        return {
          isSuccess: true,
          orderId: orderId,
          rawData: query,
          message: message || 'Success',
          rspCode: '00',
          amount: numericAmount,
          resultCode,
          transId,
          payType,
          responseTime,
          signatureValid
        }
      }

      return {
        isSuccess: false,
        orderId: orderId,
        rawData: query,
        message: message || 'Payment failed',
        rspCode: resultCode || '01',
        amount: numericAmount,
        resultCode,
        transId,
        payType,
        responseTime,
        signatureValid
      }
    } catch (error: any) {
      console.error('MoMo verifyCallback error:', error)
      return {
        isSuccess: false,
        orderId: query.orderId || '',
        rawData: query,
        message: error.message,
        rspCode: '99'
      }
    }
  }
}

export default new MomoService()