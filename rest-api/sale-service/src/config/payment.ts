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
