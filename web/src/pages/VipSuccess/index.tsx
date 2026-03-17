import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Countdown from 'react-countdown'
import { Crown, Sparkles, Check, HouseHeart, Zap, FileText, Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import successIcon from '@/assets/images/success-icon.gif'
import learnovaLogo from '@/assets/images/logo1.png'
import vipPackageService from '@/services/sale/vip-package.service'
import orderService from '@/services/sale/order.service'
import userService from '@/services/user/user.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { VipPackage } from '@/types/vip-package.type'
import { Order } from '@/types/order.type'
import { toast } from 'sonner'
import useLoading from '@/hooks/useLoading.hook'
import VipSuccessSkeleton from '@/components/VipSuccess/VipSuccessSkeleton'
import { formatCurrency } from '@/utils/common/formatPrice'
import { formatDateObj } from '@/utils/common/formattDate'

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

const VipSuccessPage = () => {
  const navigate = useNavigate()
  const { id: orderId } = useParams<{ id: string }>()
  const { loading, startLoading, stopLoading } = useLoading()
  const { setIsVip } = useAuthStore()

  const [vipPkg, setVipPkg] = useState<VipPackage | null>(null)
  const [order, setOrder] = useState<Order | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      startLoading()
      try {
        // Fetch VIP package info independently — always show page even if it fails
        vipPackageService.getVipPackageByDuration(1).then((res) => {
          if (res?.result) setVipPkg(res.result)
        })

        // Verify & sync VIP status into auth store
        userService.getVipStatus().then((res) => {
          if (res?.result) setIsVip(res.result.isVip)
        })

        // Fetch order info — redirect if unauthorized or not found
        if (orderId) {
          const orderRes = await orderService.getOrderInfo(orderId)
          if (orderRes?.code === 401 || orderRes?.code === 403) {
            toast.error('Đơn hàng không tồn tại hoặc bạn không có quyền xem.')
            navigate('/')
            return
          }
          if (orderRes?.result) setOrder(orderRes.result)
        }
      } catch (err: any) {
        const status = err?.response?.status ?? err?.response?.data?.code
        if (status === 401 || status === 403) {
          toast.error('Đơn hàng không tồn tại hoặc bạn không có quyền xem.')
          navigate('/')
          return
        }
        // other errors: still render the page without order data
      } finally {
        stopLoading()
      }
    }
    fetchData()
  }, [orderId, navigate, setIsVip])

  const activatedAt = order?.created_at ? new Date(order.created_at) : new Date()
  const expiresAt = vipPkg ? new Date(activatedAt.getTime() + vipPkg.duration_months * 30 * 24 * 60 * 60 * 1000) : null

  if (loading) return <VipSuccessSkeleton />

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        {/* Header */}
        <div className='flex justify-center mb-8'>
          <img src={learnovaLogo} alt='Learnova' className='h-8 w-auto object-contain' />
        </div>

        {/* Hero */}
        <div className='flex flex-col items-center text-center gap-4 mb-8'>
          <img src={successIcon} alt='Thanh toán VIP thành công' className='w-28 h-28 md:w-40 md:h-40 object-contain' />
          <div className='inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-100 text-yellow-700 text-sm font-semibold'>
            <Crown className='w-4 h-4' />
            Thành viên VIP
          </div>
          <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight'>
            Chúc mừng! Bạn đã là thành viên{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-600'>VIP</span>
          </h1>
          <p className='text-gray-500 text-sm md:max-w-md'>
            Gói VIP của bạn đã được kích hoạt. Hãy tận hưởng toàn bộ sức mạnh AI để tối ưu hóa khóa học của bạn ngay hôm
            nay.
          </p>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-5 gap-6 items-start'>
          {/* Left — package info */}
          <div className='md:col-span-2'>
            <Card className='border border-gray-100 shadow-sm overflow-hidden rounded-xl'>
              <div className='bg-gradient-to-br from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden'>
                <div className='absolute top-0 right-0 p-4 opacity-10'>
                  <Zap className='w-24 h-24' />
                </div>
                <div className='relative z-10'>
                  <div className='flex items-center gap-2 mb-3'>
                    <div className='p-1.5 bg-yellow-400/20 rounded-lg'>
                      <Crown className='w-5 h-5 text-yellow-300' />
                    </div>
                    <span className='text-sm font-semibold text-blue-100 uppercase tracking-wide'>
                      Gói đã kích hoạt
                    </span>
                  </div>
                  <p className='text-2xl font-extrabold tracking-tight'>{vipPkg?.name ?? 'VIP Member'}</p>
                  <p className='text-blue-100 text-sm mt-1 flex items-center gap-1'>
                    <FileText className='w-3.5 h-3.5' />
                    {vipPkg?.duration_months ?? 1} tháng sử dụng
                  </p>
                </div>
              </div>

              <CardContent className='pt-4 pb-5 space-y-3'>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Giá gói</span>
                  <span className='font-semibold text-gray-800'>{formatCurrency(vipPkg?.price)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-gray-500'>Ngày kích hoạt</span>
                  <span className='font-medium text-gray-800'>{formatDateObj(activatedAt)}</span>
                </div>
                <div className='flex justify-between text-sm border-t pt-3'>
                  <span className='text-gray-500'>Ngày hết hạn</span>
                  <span className='font-semibold text-indigo-600'>{expiresAt ? formatDateObj(expiresAt) : '—'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right — benefits */}
          <div className='md:col-span-3'>
            <Card className='border border-gray-100 shadow-sm rounded-xl h-full'>
              <CardHeader className='pb-3'>
                <CardTitle className='text-sm flex items-center gap-2 text-gray-700'>
                  <Sparkles className='w-4 h-4 text-blue-500' />
                  Các quyền lợi của bạn
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className='space-y-5'>
                  {features.map((feature, index) => (
                    <li key={index} className='flex gap-4'>
                      <div className='flex-shrink-0 mt-0.5'>
                        <div className='w-6 h-6 rounded bg-blue-600 flex items-center justify-center'>
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
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Order detail card — full width */}
        {orderId && (
          <Card className='border border-gray-100 shadow-sm rounded-xl mt-4'>
            <CardHeader className='pb-2 pt-4'>
              <CardTitle className='text-xs flex items-center gap-1 text-gray-400 font-normal'>
                <Info className='w-3.5 h-3.5' />
                Thông tin đơn hàng
              </CardTitle>
            </CardHeader>
            <CardContent className='pb-4'>
              <div className='flex flex-wrap gap-x-12 gap-y-2'>
                <div className='flex items-center gap-2 text-sm'>
                  <span className='text-gray-500'>Mã đơn</span>
                  <span className='font-mono text-[11px] text-gray-700 bg-gray-50 px-2 py-0.5 rounded border border-gray-200'>
                    {orderId}
                  </span>
                </div>
                {order?.customer_name && (
                  <div className='flex items-center gap-2 text-sm'>
                    <span className='text-gray-500'>Khách hàng</span>
                    <span className='font-medium text-gray-800'>{order.customer_name}</span>
                  </div>
                )}
                {order?.customer_email && (
                  <div className='flex items-center gap-2 text-sm'>
                    <span className='text-gray-500'>Email</span>
                    <span className='text-gray-700 text-xs'>{order.customer_email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Auto-redirect */}
        <div className='mt-8 flex flex-col items-center gap-3'>
          <button
            onClick={() => navigate('/')}
            className='inline-flex items-center gap-2 px-8 py-2.5 rounded-full bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm'
          >
            <HouseHeart className='w-4 h-4' />
            Quay về trang chủ
          </button>
          <p className='text-xs text-gray-400'>
            <Countdown
              date={Date.now() + 5 * 60 * 1000}
              onComplete={() => navigate('/')}
              renderer={({ minutes, seconds, completed }) => {
                if (completed) return null
                const mm = String(minutes).padStart(2, '0')
                const ss = String(seconds).padStart(2, '0')
                return (
                  <span>
                    Tự động chuyển hướng sau{' '}
                    <span className='font-semibold text-gray-600'>
                      {mm}:{ss}
                    </span>
                  </span>
                )
              }}
            />
          </p>
        </div>
      </div>
    </div>
  )
}

export default VipSuccessPage
