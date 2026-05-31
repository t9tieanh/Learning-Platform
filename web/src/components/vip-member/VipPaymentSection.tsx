import { useState } from 'react'
import { checkoutPaymentEnabled } from '@/config/payment.config'
import PaymentDevGate from '@/components/payment/PaymentDevGate'
import VipPaymentMethods from '@/components/vip-member/VipPaymentMethods'

type VipPaymentSectionProps = {
  userEmail: string
}

const VipPaymentSection = ({ userEmail }: VipPaymentSectionProps) => {
  const [paymentUnlocked, setPaymentUnlocked] = useState(checkoutPaymentEnabled)

  if (paymentUnlocked) {
    return <VipPaymentMethods userEmail={userEmail} />
  }

  return (
    <div className='space-y-3'>
      <p className='text-center text-xs text-gray-500 leading-relaxed'>
        Thanh toán đang khóa trên môi trường này. Nhập mật khẩu dev để mở cổng test.
      </p>
      <PaymentDevGate layout='column' onUnlock={() => setPaymentUnlocked(true)} />
    </div>
  )
}

export default VipPaymentSection
