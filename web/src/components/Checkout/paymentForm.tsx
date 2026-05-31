import CustomInput from '@/components/common/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'
import { Order } from '@/types/order.type'
import { useEffect, useState } from 'react'
import CheckoutPaymentSection from '@/components/Checkout/CheckoutPaymentSection'

const PaymentForm = ({ order }: { order: Order | null }) => {
  const [receiveEmail, setReceiveEmail] = useState(order?.customer_email || '')

  useEffect(() => {
    setReceiveEmail(order?.customer_email || '')
  }, [order])

  return (
    <div className='payment-form space-y-6'>
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='font-semibold text-base flex items-center gap-2'>
            <User className='w-5 h-5' />
            Thông tin liên hệ
          </CardTitle>
          <CardDescription>Email xác nhận đơn hàng sẽ được gửi về email này.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <CustomInput
            disabled
            label='Họ và tên'
            value={order?.customer_name || ''}
            placeholder='Nhập họ và tên của bạn'
            required
          />
          <CustomInput
            label='Email nhận hóa đơn (Bạn có thể thay đổi email nhận hóa đơn tại đây)'
            value={receiveEmail}
            placeholder='email@example.com'
            onChange={(e) => setReceiveEmail(e.target.value)}
            required
          />
        </CardContent>
      </Card>

      <CheckoutPaymentSection receiveEmail={receiveEmail} />
    </div>
  )
}

export default PaymentForm
