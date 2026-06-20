import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { WalletCards } from 'lucide-react'
import { checkoutPaymentEnabled } from '@/config/payment.config'
import PaymentDevGate from '@/components/payment/PaymentDevGate'
import CheckoutPaymentMethods from '@/components/Checkout/CheckoutPaymentMethods'

type CheckoutPaymentSectionProps = {
  receiveEmail: string
}

const CheckoutPaymentSection = ({ receiveEmail }: CheckoutPaymentSectionProps) => {
  const [paymentUnlocked, setPaymentUnlocked] = useState(checkoutPaymentEnabled)

  return (
    <Card className='shadow-sm overflow-hidden'>
      <CardHeader className='px-4 sm:px-6'>
        <CardTitle className='font-semibold text-base flex items-center gap-2'>
          <WalletCards className='w-5 h-5' />
          Chọn phương thức thanh toán
        </CardTitle>
        <CardDescription>
          {paymentUnlocked
            ? 'Vui lòng chọn phương thức thanh toán của bạn để hoàn thành đơn hàng.'
            : 'Thanh toán đang khóa trên môi trường này. Nhập mật khẩu dev để mở cổng test.'}
        </CardDescription>
      </CardHeader>
      <CardContent className='px-4 sm:px-6'>
        {paymentUnlocked ? (
          <CheckoutPaymentMethods receiveEmail={receiveEmail} />
        ) : (
          <PaymentDevGate onUnlock={() => setPaymentUnlocked(true)} />
        )}
      </CardContent>
    </Card>
  )
}

export default CheckoutPaymentSection
