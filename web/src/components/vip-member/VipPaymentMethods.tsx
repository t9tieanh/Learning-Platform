import CustomButton from '@/components/common/Button'
import VnPayLogo from '@/assets/images/Icon-VNPAY-QR.webp'
import PayOSLogo from '@/assets/images/payos-icon.png'
import momoLogo from '@/assets/images/momo-logo.webp'
import { toast } from 'sonner'
import orderService from '@/services/sale/order.service'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'

type VipPaymentMethodsProps = {
  userEmail: string
}

const VipPaymentMethods = ({ userEmail }: VipPaymentMethodsProps) => {
  const handlePayWithVnPay = async () => {
    const confirmed = await showConfirmToast({
      title: (
        <div className='flex items-center gap-2'>
          Xác nhận nâng cấp VIP
          <img src={VnPayLogo} alt='VnPay' className='h-5 w-auto' />
        </div>
      ),
      description: 'Bạn sắp thanh toán mua gói VIP qua VnPay. Bạn có chắc chắn muốn tiếp tục?',
      confirmLabel: 'Kiểm tra & Thanh toán',
      cancelLabel: 'Hủy'
    })

    if (!confirmed) return

    try {
      const response = await orderService.processVipPayment('VNPAY', userEmail)
      if (response && response.code === 200 && response.result) {
        toast.success('Đang chuyển đến trang thanh toán VnPay...')
        window.location.href = response.result.payment.payUrl
      } else {
        toast.error(response.message || 'Không thể khởi tạo thanh toán VnPay. Vui lòng thử lại.')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.')
    }
  }

  const handlePayWithMomo = async () => {
    const confirmed = await showConfirmToast({
      title: (
        <div className='flex items-center gap-2'>
          Xác nhận nâng cấp VIP
          <img src={momoLogo} alt='Momo' className='h-5 w-auto' />
        </div>
      ),
      description: 'Bạn sắp thanh toán mua gói VIP qua ví MoMo. Bạn có chắc chắn muốn tiếp tục?',
      confirmLabel: 'Thanh toán MoMo',
      cancelLabel: 'Hủy'
    })

    if (!confirmed) return

    try {
      const response = await orderService.processVipPayment('MOMO', userEmail)
      if (response && response.code === 200 && response.result) {
        toast.success('Đang chuyển đến trang thanh toán Momo...')
        window.location.href = response.result.payment.payUrl
      } else {
        toast.error(response.message || 'Không thể khởi tạo thanh toán Momo. Vui lòng thử lại.')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.')
    }
  }

  const handlePayWithPayos = async () => {
    const confirmed = await showConfirmToast({
      title: (
        <div className='flex items-center gap-2'>
          Xác nhận nâng cấp VIP
          <img src={PayOSLogo} alt='PayOS Logo' className='h-5 w-auto' />
        </div>
      ),
      description: 'Bạn sắp thanh toán gói VIP qua PayOS (VietQR). Bạn có chắc chắn muốn tiếp tục?',
      confirmLabel: 'Thanh toán PayOS',
      cancelLabel: 'Hủy'
    })

    if (!confirmed) return

    try {
      const response = await orderService.processVipPayment('PAYOS', userEmail)
      if (response && response.code === 200 && response.result) {
        toast.success('Đang chuyển đến trang thanh toán PayOS...')
        window.location.href = response.result.payment.payUrl
      } else {
        toast.error(response.message || 'Không thể khởi tạo thanh toán PayOS. Vui lòng thử lại.')
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đã có lỗi xảy ra, vui lòng thử lại sau.')
    }
  }

  return (
    <div className='flex flex-col gap-3'>
      <CustomButton
        type='button'
        className='w-full h-11 text-sm font-semibold rounded-xl bg-[#A50064] hover:bg-[#8A0053] text-white shadow-md transition-all hover:-translate-y-0.5'
        label='Thanh toán bằng MoMo'
        onClick={handlePayWithMomo}
        icon={
          <div className='bg-white p-0.5 rounded mr-2'>
            <img src={momoLogo} alt='Momo Logo' className='h-5 w-auto' />
          </div>
        }
      />
      <CustomButton
        type='button'
        className='w-full h-11 text-sm font-semibold rounded-xl bg-[#005BAA] hover:bg-[#004A8B] text-white shadow-md transition-all hover:-translate-y-0.5'
        label='Thanh toán bằng VNPay'
        onClick={handlePayWithVnPay}
        icon={
          <div className='bg-white p-0.5 rounded mr-2'>
            <img src={VnPayLogo} alt='VnPay Logo' className='h-5 w-auto object-contain' />
          </div>
        }
      />
      <CustomButton
        type='button'
        className='w-full h-11 text-sm font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:-translate-y-0.5'
        label='Thanh toán PayOS (VietQR)'
        onClick={handlePayWithPayos}
        icon={
          <div className='bg-white p-0.5 rounded mr-2'>
            <img src={PayOSLogo} alt='PayOS Logo' className='h-5 w-auto' />
          </div>
        }
      />
    </div>
  )
}

export default VipPaymentMethods
