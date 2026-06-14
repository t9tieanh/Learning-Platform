import CustomButton from '@/components/common/Button'
import PayOSLogo from '@/assets/images/payos-icon.png'
import momoLogo from '@/assets/images/momo-logo.webp'
import { toast } from 'sonner'
import orderService from '@/services/sale/order.service'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'

type CheckoutPaymentMethodsProps = {
  receiveEmail: string
}

const paymentButtonClass =
  '!w-fit shrink-0 px-3 py-2 rounded-md shadow-sm text-sm whitespace-nowrap'

const CheckoutPaymentMethods = ({ receiveEmail }: CheckoutPaymentMethodsProps) => {
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
    <div className='flex flex-row flex-nowrap items-center justify-start gap-2 overflow-x-auto'>
      <CustomButton
        type='button'
        className={`${paymentButtonClass} bg-emerald-100 text-black hover:bg-gray-200`}
        label='Thanh toán bằng PayOS'
        onClick={handlePayWithPayos}
        icon={<img src={PayOSLogo} alt='PayOS Logo' className='h-5 w-auto' />}
      />
      <CustomButton
        type='button'
        className={`${paymentButtonClass} bg-pink-200 text-black hover:bg-gray-200`}
        label='Thanh toán bằng Momo'
        onClick={handlePayWithMomo}
        icon={<img src={momoLogo} alt='Momo Logo' className='h-5 w-auto' />}
      />
    </div>
  )
}

export default CheckoutPaymentMethods
