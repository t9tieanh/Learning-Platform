import React from 'react'
import CustomDialog from '@/components/common/Dialog'
import CustomButton from '@/components/common/Button'
import { Check, Sparkles, Crown, Zap, FileText } from 'lucide-react'
import learnovaLogo from '@/assets/images/logo1.png'
import VnPayLogo from '@/assets/images/Icon-VNPAY-QR.webp'
import momoLogo from '@/assets/images/momo-logo.webp'
import { toast } from 'sonner'
import orderService from '@/services/sale/order.service'
import vipPackageService from '@/services/sale/vip-package.service'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import { useAuthStore } from '@/stores/useAuth.stores'
import { VipPackage } from '@/types/vip-package.type'

interface VipUpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpgrade?: () => void
}

const features = [
  {
    title: 'Trợ lý AI phân tích nội dung',
    description: 'Tự động chia nhỏ video và tài liệu thành các phân đoạn học.'
  },
  {
    title: 'Tự động tạo tóm tắt chi tiết',
    description: 'AI tự động tóm tắt kiến thức cốt lõi cho từng bài giảng.'
  },
  {
    title: 'Gợi ý tiêu đề bài học thông minh',
    description: 'Phân tích nội dung và đưa ra tiêu đề thu hút người học.'
  },
  {
    title: 'Truy cập sớm các tính năng mới',
    description: 'Luôn là người đầu tiên trải nghiệm tính năng AI mới nhất.'
  }
]

const VipUpgradeDialog: React.FC<VipUpgradeDialogProps> = ({ open, onOpenChange, onUpgrade }) => {
  const { data } = useAuthStore()
  const userEmail = data?.email || ''
  const [vipPkg, setVipPkg] = React.useState<VipPackage | null>(null)
  const [isLoadingPackage, setIsLoadingPackage] = React.useState(false)

  React.useEffect(() => {
    if (open && !vipPkg) {
      const fetchPackage = async () => {
        setIsLoadingPackage(true)
        try {
          const res = await vipPackageService.getVipPackageByDuration(1)
          if (res && res.result) {
            setVipPkg(res.result)
          }
        } catch (error) {
          console.error('Failed to fetch VIP package', error)
        } finally {
          setIsLoadingPackage(false)
        }
      }
      fetchPackage()
    }
  }, [open, vipPkg])

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

  return (
    <CustomDialog
      open={open}
      setOpen={onOpenChange}
      title={<span className='sr-only'>Nâng cấp VIP</span>}
      size='xl'
      className='w-[95vw] max-w-5xl p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-3xl gap-0 border-none'
      contentClassName='my-0 w-full'
    >
      <div className='flex flex-col md:flex-row h-auto md:h-[600px] max-h-[85vh] overflow-y-auto md:overflow-hidden'>
        {/* Left Pane - Feature List */}
        <div className='flex-1 p-6 sm:p-10 md:p-14 flex flex-col justify-center bg-gradient-to-br from-blue-50/50 to-indigo-50/50'>
          <div className='flex items-center gap-2 mb-6 md:mb-8'>
            <img src={learnovaLogo} alt='Learnova' className='h-6 md:h-8 w-auto object-contain' />
          </div>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2 tracking-tight'>
            Gói Thành Viên{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600'>VIP</span>
          </h2>
          <p className='text-blue-600 font-semibold text-lg md:text-xl mb-6 md:mb-8 flex items-center gap-2'>
            <Sparkles className='w-5 h-5' /> Tối ưu hóa khóa học với AI
          </p>

          <ul className='space-y-4 md:space-y-5'>
            {features.map((feature, index) => (
              <li key={index} className='flex gap-4'>
                <div className='flex-shrink-0 mt-0.5'>
                  <div className='w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center shadow-sm shadow-blue-200'>
                    <Check className='w-4 h-4 text-white' strokeWidth={3} />
                  </div>
                </div>
                <div>
                  <h4 className='text-gray-900 font-medium text-[15px]'>{feature.title}</h4>
                  <p className='text-gray-500 text-sm mt-0.5 leading-relaxed'>{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Right Pane - Call to Action visual */}
        <div className='w-full md:w-[400px] bg-white p-6 sm:p-8 md:p-10 flex flex-col justify-between shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-10 relative'>
          {/* Decorative background element */}
          <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-yellow-100/40 to-orange-100/40 rounded-bl-full -z-10 blur-2xl hidden md:block'></div>

          <div className='space-y-6'>
            <div className='inline-flex items-center justify-center p-3 bg-yellow-100 rounded-2xl mb-2 text-yellow-600'>
              <Crown className='w-8 h-8' />
            </div>

            {isLoadingPackage ? (
              <div className='space-y-2'>
                <div className='h-8 bg-gray-200 rounded animate-pulse w-3/4'></div>
                <div className='h-6 bg-gray-200 rounded animate-pulse w-1/2'></div>
              </div>
            ) : (
              <h3 className='text-xl md:text-2xl font-bold text-gray-900 leading-snug uppercase tracking-wide'>
                Chỉ với {vipPkg?.price?.toLocaleString('vi-VN')}₫<br className='hidden md:block' /> cho{' '}
                {vipPkg?.duration_months} tháng
              </h3>
            )}

            <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden'>
              {/* Subtle pattern inside the card */}
              <div className='absolute top-0 right-0 p-4 opacity-10'>
                <Zap className='w-24 h-24' />
              </div>
              <div className='relative z-10 space-y-3 md:space-y-4'>
                <p className='font-semibold text-base md:text-lg flex items-center gap-2'>
                  <FileText className='w-5 h-5' />
                  Chỉ cần tải video lên
                </p>
                <p className='text-blue-100 text-xs md:text-sm leading-relaxed'>
                  Mọi việc phân tích, chia nhỏ bài học và tạo tóm tắt chuyên sâu cứ để AI của chúng tôi lo.
                </p>
              </div>
            </div>
          </div>

          <div className='mt-8 pt-6 border-t border-gray-100'>
            <p className='text-center text-[11px] md:text-xs text-gray-400 mb-4 px-2 md:px-4 leading-relaxed'>
              Bằng cách nâng cấp, bạn đồng ý với{' '}
              <a href='#' className='underline hover:text-gray-700'>
                Điều khoản & Điều kiện
              </a>{' '}
              của chúng tôi.
            </p>
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
            </div>
          </div>
        </div>
      </div>
    </CustomDialog>
  )
}

export default VipUpgradeDialog
