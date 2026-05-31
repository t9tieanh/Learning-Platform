import React from 'react'
import CustomDialog from '@/components/common/Dialog'
import CustomButton from '@/components/common/Button'
import { Check, Sparkles, Crown, Zap, FileText, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import learnovaLogo from '@/assets/images/logo1.png'
import vipPackageService from '@/services/sale/vip-package.service'
import VipPaymentSection from '@/components/vip-member/VipPaymentSection'
import { useAuthStore } from '@/stores/useAuth.stores'
import { VipPackage } from '@/types/vip-package.type'

interface VipUpgradeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpgrade?: () => void
}

const features = [
  {
    title: 'Phân tích & chia nhỏ bài học bằng AI',
    description:
      'Tự động xử lý video và tài liệu thành các phân đoạn có cấu trúc — nền tảng để xây giáo trình và nội dung ôn tập.'
  },
  {
    title: 'Trợ lý AI khi học từng bài',
    description:
      'Học viên được hỏi đáp, xem phân tích và tóm tắt nội dung bài giảng dựa trên chính bài học đang mở.'
  },
  {
    title: 'Tạo câu hỏi ôn tập / kiểm tra từ nội dung',
    description:
      'Giảng viên dùng AI sinh bộ câu hỏi trắc nghiệm theo từng đoạn bài học — soạn đề nhanh, đồng bộ với video.'
  },
  {
    title: 'Gợi ý nội dung Learnova AI',
    description:
      'Trong trình biên soạn giáo trình, nhận gợi ý và tạo hàng loạt nội dung hỗ trợ từ Learnova AI.'
  }
]

const VipUpgradeDialog: React.FC<VipUpgradeDialogProps> = ({ open, onOpenChange }) => {
  const navigate = useNavigate()
  const { data } = useAuthStore()
  const isLoggedIn = !!data
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

  return (
    <CustomDialog
      open={open}
      setOpen={onOpenChange}
      title={<span className='sr-only'>Nâng cấp VIP</span>}
      size='xl'
      className='w-[95vw] max-w-5xl max-h-[min(92vh,920px)] p-0 overflow-hidden bg-white border-0 shadow-2xl rounded-3xl gap-0 border-none flex flex-col'
      contentClassName='my-0 w-full flex flex-1 min-h-0 flex-col overflow-hidden p-0'
    >
      <div className='flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain md:flex-row md:max-h-[min(92vh,920px)]'>
        {/* Left Pane - Feature List */}
        <div className='flex-1 p-6 sm:p-10 md:p-14 flex flex-col justify-start bg-gradient-to-br from-blue-50/50 to-indigo-50/50 md:overflow-y-auto md:min-h-0'>
          <div className='flex items-center gap-2 mb-6 md:mb-8'>
            <img src={learnovaLogo} alt='Learnova' className='h-6 md:h-8 w-auto object-contain' />
          </div>
          <h2 className='text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2 tracking-tight'>
            Gói Thành Viên{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600'>VIP</span>
          </h2>
          <p className='text-blue-600 font-semibold text-lg md:text-xl mb-6 md:mb-8 flex items-center gap-2'>
            <Sparkles className='w-5 h-5 shrink-0' aria-hidden /> Dành cho giảng viên & học viên — mở khóa AI trên Learnova
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
        <div className='w-full md:w-[400px] md:max-w-[400px] shrink-0 bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.03)] relative md:overflow-y-auto md:min-h-0'>
          {/* Animated VIP glow — clipped so content can scroll above */}
          <div
            className='pointer-events-none absolute inset-0 z-0 overflow-hidden'
            aria-hidden
          >
            <motion.div
              className='absolute -right-12 -top-8 h-56 w-56 rounded-full bg-gradient-to-br from-amber-200/55 to-yellow-400/40 blur-3xl md:h-64 md:w-64'
              animate={{
                x: [0, 18, -12, 8, 0],
                y: [0, 22, 8, -14, 0],
                scale: [1, 1.12, 0.92, 1.06, 1]
              }}
              transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className='absolute right-4 top-1/3 h-44 w-44 rounded-full bg-gradient-to-tr from-orange-200/35 to-amber-300/30 blur-3xl md:h-52 md:w-52'
              animate={{
                x: [0, -20, 14, -6, 0],
                y: [0, -12, 18, 6, 0],
                scale: [1, 0.9, 1.1, 1]
              }}
              transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
            />
          </div>

          <div className='relative z-10 flex flex-col gap-8 p-6 sm:p-8 md:p-10 pb-8'>
            <div className='space-y-6'>
              <div className='inline-flex items-center justify-center p-3 bg-yellow-100 rounded-2xl mb-2 text-yellow-600'>
                <Crown className='w-8 h-8' aria-hidden />
              </div>

              {isLoadingPackage ? (
                <div className='space-y-2'>
                  <div className='h-8 bg-gray-200 rounded animate-pulse w-3/4'></div>
                  <div className='h-6 bg-gray-200 rounded animate-pulse w-1/2'></div>
                </div>
              ) : (
                <>
                  <h3 className='text-xl md:text-2xl font-bold text-gray-900 leading-snug uppercase tracking-wide'>
                    Chỉ với {vipPkg?.price?.toLocaleString('vi-VN')}₫<br className='hidden md:block' /> cho{' '}
                    {vipPkg?.duration_months} tháng
                  </h3>
                  {vipPkg?.description ? (
                    <p className='text-sm text-gray-500 leading-relaxed'>{vipPkg.description}</p>
                  ) : null}
                </>
              )}

              <div className='bg-gradient-to-r from-blue-600 to-indigo-600 p-6 rounded-2xl text-white shadow-xl shadow-blue-500/20 relative overflow-hidden'>
                <div className='absolute top-0 right-0 p-4 opacity-10'>
                  <Zap className='w-24 h-24' aria-hidden />
                </div>
                <div className='relative z-10 space-y-3 md:space-y-4'>
                  <p className='font-semibold text-base md:text-lg flex items-center gap-2'>
                    <FileText className='w-5 h-5 shrink-0' aria-hidden />
                    Tải lên bài học — AI lo phần còn lại
                  </p>
                  <p className='text-blue-100 text-xs md:text-sm leading-relaxed'>
                    VIP bật phân tích & chia nhỏ nội dung, trợ lý khi học viên học bài và công cụ tạo câu hỏi ôn tập
                    cho giảng viên.
                  </p>
                </div>
              </div>
            </div>

            <div className='pt-6 border-t border-gray-100'>
              {isLoggedIn ? (
                <>
                  <p className='text-center text-[11px] md:text-xs text-gray-400 mb-4 px-2 md:px-4 leading-relaxed'>
                    Bằng cách nâng cấp, bạn đồng ý với{' '}
                    <a href='#' className='underline hover:text-gray-700'>
                      Điều khoản & Điều kiện
                    </a>{' '}
                    của chúng tôi.
                  </p>
                  <VipPaymentSection userEmail={userEmail} />
                </>
              ) : (
                <>
                  <p className='text-center text-sm text-gray-500 mb-4 px-1 leading-relaxed'>
                    Đăng nhập để thanh toán và kích hoạt gói VIP Learnova.
                  </p>
                  <CustomButton
                    type='button'
                    className='w-full h-12 text-sm font-semibold rounded-xl bg-pink-800 hover:bg-pink-900 text-white shadow-md transition-all hover:-translate-y-0.5'
                    label='Đăng nhập để tiếp tục khám phá'
                    onClick={() => {
                      onOpenChange(false)
                      navigate('/auth')
                    }}
                    icon={<LogIn className='w-4 h-4' />}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </CustomDialog>
  )
}

export default VipUpgradeDialog
