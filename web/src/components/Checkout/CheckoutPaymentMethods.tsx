import CustomButton from '@/components/common/Button'
import VnPayLogo from '@/assets/images/Icon-VNPAY-QR.webp'
import PayOSLogo from '@/assets/images/payos-icon.png'
import momoLogo from '@/assets/images/momo-logo.webp'
import { toast } from 'sonner'
import orderService from '@/services/sale/order.service'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'

type CheckoutPaymentMethodsProps = {
  receiveEmail: string
}

const CheckoutPaymentMethods = ({ receiveEmail }: CheckoutPaymentMethodsProps) => {
  const handlePayWithVnPay = async () => {
    const confirmed = await showConfirmToast({
      title: (
        <div className='flex items-center gap-2'>
          Xác nhận thanh toán
          <img src={VnPayLogo} alt='VnPay Logo' className='h-5 w-auto' />
        </div>
      ),
      description: 'Bạn sắp thanh toán qua VnPay. Bạn có chắc chắn muốn tiếp tục?',
      confirmLabel: 'Có, tiếp tục',
      cancelLabel: 'Hủy'
    })

    if (!confirmed) return

    try {
      const response = await orderService.processPayment('VNPAY', receiveEmail)
      if (response && response.code === 200 && response.result) {
        toast.success('Đang chuyển đến trang thanh toán VnPay...')
        window.location.href = response.result.payment.payUrl
      } else {
        toast.error(response.message || 'Không thể khởi tạo thanh toán VnPay. Vui lòng thử lại.')
      }
    } catch (error: any) {
      toast.error(error?.response?.data.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.')
    }
  }

  const handlePayWithMomo = async () => {
    const confirmed = await showConfirmToast({
      title: (
        <div className='flex items-center gap-2'>
          Xác nhận thanh toán
          <img src={momoLogo} alt='Momo Logo' className='h-5 w-auto' />
        </div>
      ),
      description: 'Bạn sắp thanh toán qua Momo. Bạn có chắc chắn muốn tiếp tục?',
      confirmLabel: 'Có, tiếp tục',
      cancelLabel: 'Hủy'
    })

    if (!confirmed) return

    try {
      const response = await orderService.processPayment('MOMO', receiveEmail)
      if (response && response.code === 200 && response.result) {
        toast.success('Đang chuyển đến trang thanh toán Momo...')
        window.location.href = response.result.payment.payUrl
      } else {
        toast.error(response.message || 'Không thể khởi tạo thanh toán Momo. Vui lòng thử lại.')
      }
    } catch (error: any) {
      toast.error(error?.response?.data.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.')
    }
  }

  const handlePayWithPayos = async () => {
    const confirmed = await showConfirmToast({
      title: (
        <div className='flex items-center gap-2'>
          Xác nhận thanh toán
          <img src={PayOSLogo} alt='PayOS Logo' className='h-5 w-auto' />
        </div>
      ),
      description: 'Bạn sắp thanh toán qua chuyển khoản VietQR (PayOS). Bạn có chắc chắn muốn tiếp tục?',
      confirmLabel: 'Có, tiếp tục',
      cancelLabel: 'Hủy'
    })

    if (!confirmed) return

    try {
      const response = await orderService.processPayment('PAYOS', receiveEmail)
      if (response && response.code === 200 && response.result) {
        toast.success('Đang chuyển đến trang thanh toán PayOS...')
        window.location.href = response.result.payment.payUrl
      } else {
        toast.error(response.message || 'Không thể khởi tạo thanh toán PayOS. Vui lòng thử lại.')
      }
    } catch (error: any) {
      toast.error(error?.response?.data.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.')
    }
  }

  return (
    <div className='flex flex-col gap-3 w-full'>
      <CustomButton
        type='submit'
        className='w-full sm:w-auto bg-pink-200 text-black py-2 rounded-md hover:bg-gray-200 shadow-sm'
        label='Thanh toán bằng Momo'
        onClick={handlePayWithMomo}
        icon={
          <img src={momoLogo} alt='Momo Logo' className='h-6 w-auto' />
        }
      />
      <CustomButton
        type='submit'
        className='w-full sm:w-auto bg-emerald-100 text-black py-2 rounded-md hover:bg-gray-200 shadow-sm'
        label='Thanh toán PayOS (VietQR)'
        onClick={handlePayWithPayos}
        icon={
          <img src={PayOSLogo} alt='PayOS Logo' className='h-6 w-auto' />
        }
      />
    </div>
  )
}

export default CheckoutPaymentMethods
