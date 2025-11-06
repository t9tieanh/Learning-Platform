import { SquareChartGantt, SkipBack } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import CustomInput from '@/components/common/Input'
import VnPayLogo from '@/assets/images/Icon-VNPAY-QR.webp'

const PaymentForm = () => {
  return (
    <div className='payment-form'>
      <h2 className='text-lg font-semibold flex items-center mb-4 gap-2'>
        <SquareChartGantt /> Xem lại thông tin thanh toán
      </h2>
      <form className='space-y-4 p-4 rounded-md'>
        <CustomInput label='Họ và tên' placeholder='Nhập họ và tên của bạn' required />
        <CustomInput label='Email nhận hóa đơn' placeholder='email@example.com' required />
        <div className='flex justify-between'>
          <CustomButton
            type='submit'
            className='bg-white-600 text-black py-2 rounded-md hover:bg-gray-200 hover:text-white'
            label='Trở lại'
            icon={<SkipBack className='h-4 w-4 ml-1' />}
          />
          <CustomButton
            type='submit'
            className='bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700'
            label='Thanh toán bằng VnPay'
            icon={
              <>
                <img src={VnPayLogo} alt='VnPay Logo' className='h-6 w-auto' />
              </>
            }
          />
        </div>
      </form>
    </div>
  )
}

export default PaymentForm
