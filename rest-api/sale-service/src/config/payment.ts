export const vnpayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || '',
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || '',
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_redirectUrl: process.env.VNPAY_REDIRECT_URL || 'http://localhost:4000/api/orders/verify'
}

export const momoConfig = {
  partnerCode: process.env.MOMO_PARTNER_CODE || '',
  partnerName: process.env.MOMO_PARTNER_NAME || '',
  accessKey: process.env.MOMO_ACCESS_KEY || '',
  secretKey: process.env.MOMO_SECRET_KEY || '',
  apiEndpoint: process.env.MOMO_API_ENDPOINT || 'https://test-payment.momo.vn',
  ipnUrl: process.env.MOMO_IPN_URL || 'http://localhost:8888/api/payment/momo/ipn',
  redirectUrl: process.env.MOMO_REDIRECT_URL ||'http://localhost:4000/api/orders/verify'
}

export const payosConfig = {
  clientId: process.env.PAYOS_CLIENT_ID || '',
  apiKey: process.env.PAYOS_API_KEY || '',
  checksumKey: process.env.PAYOS_CHECKSUM_KEY || '',
  returnUrl:
    process.env.PAYOS_RETURN_URL || 'http://localhost:3005/orders/verify-order/payos',
  cancelUrl:
    process.env.PAYOS_CANCEL_URL || 'http://localhost:3005/orders/cancel-order/payos',
  webhookUrl:
    process.env.PAYOS_WEBHOOK_URL || 'http://localhost:4000/orders/payment/payos/webhook',
  webhookConfirmInitialDelayMs: (() => {
    const parsed = Number.parseInt(process.env.PAYOS_WEBHOOK_CONFIRM_INITIAL_DELAY_MS ?? '', 10)
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 30000
  })(),
  webhookConfirmRetryDelaysMs: (() => {
    const delays = (process.env.PAYOS_WEBHOOK_CONFIRM_RETRY_DELAYS_MS ?? '')
      .split(',')
      .map((part) => Number.parseInt(part.trim(), 10))
      .filter((delay) => Number.isFinite(delay) && delay > 0)
    return delays.length > 0 ? delays : [15000, 30000, 45000, 60000, 90000, 120000]
  })(),
}
