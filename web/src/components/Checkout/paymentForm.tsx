import CustomButton from '@/components/common/Button'
import CustomInput from '@/components/common/Input'
import VnPayLogo from '@/assets/images/Icon-VNPAY-QR.webp'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import momoLogo from '@/assets/images/momo-logo.webp'
import { User, WalletCards } from 'lucide-react'

const PaymentForm = () => {
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
          <CustomInput disabled label='Họ và tên' placeholder='Nhập họ và tên của bạn' required />
          <CustomInput label='Email nhận hóa đơn' placeholder='email@example.com' required />
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
