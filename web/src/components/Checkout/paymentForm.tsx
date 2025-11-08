import CustomButton from '@/components/common/Button'
import CustomInput from '@/components/common/Input'
import VnPayLogo from '@/assets/images/Icon-VNPAY-QR.webp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import momoLogo from '@/assets/images/momo-logo.webp'
import { User, WalletCards } from 'lucide-react'
import { Order } from '@/types/order.type'
import { toast } from 'sonner'
import orderService from '@/services/sale/order.service'
import { useEffect, useState } from 'react'

const PaymentForm = ({ order }: { order: Order | null }) => {
  const [receiveEmail, setReceiveEmail] = useState(order?.customer_email || '')

  useEffect(() => {
    setReceiveEmail(order?.customer_email || '')
  }, [order])

  const handlePayWithVnPay = async () => {
    try {
      const response = await orderService.processPayment('VNPAY', receiveEmail)
      if (response && response.code === 200 && response.result) {
        window.location.href = response.result.payment.payUrl
      } else {
        toast.error(response.message || 'Không thể khởi tạo thanh toán VnPay. Vui lòng thử lại.')
      }
    } catch (error: any) {
      toast.error(error?.response?.data.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.')
    }
  }

  const handlePayWithMomo = () => {
    toast.error('Chức năng thanh toán bằng Momo đang được phát triển.')
  }

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
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='font-semibold text-base flex items-center gap-2'>
            <WalletCards className='w-5 h-5' />
            Chọn phương thức thanh toán
          </CardTitle>
          <CardDescription>Vui lòng chọn phương thức thanh toán của bạn để hoàn thành đơn hàng.</CardDescription>
        </CardHeader>
        <CardContent className='space-x-4'>
          <CustomButton
            type='submit'
            className='bg-pink-200 text-black py-2 rounded-md hover:bg-gray-200 shadow-sm'
            label='Thanh toán bằng Momo'
            onClick={handlePayWithMomo}
            icon={
              <>
                <img src={momoLogo} alt='Momo Logo' className='h-6 w-auto' />
              </>
            }
          />
          <CustomButton
            type='submit'
            className='bg-blue-300 text-gray py-2 rounded-md hover:bg-gray-200 shadow-sm'
            label='Thanh toán bằng VnPay'
            onClick={handlePayWithVnPay}
            icon={
              <>
                <img src={VnPayLogo} alt='VnPay Logo' className='h-6 w-auto' />
              </>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default PaymentForm
