import { HouseHeart, Info } from 'lucide-react'
import Countdown from 'react-countdown'
import { useNavigate } from 'react-router-dom'
import successIcon from '@/assets/images/success-icon.gif'
import failIcon from '@/assets/images/fail-icon.gif'
import pendingIcon from '@/assets/images/pending-icon.webp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Order, OrderStatus } from '@/types/order.type'
import { formatCurrency } from '@/utils/common/formatPrice'

const OrderSuccess = ({ order, id }: { order: Order; id: string }) => {
  const navigate = useNavigate()

  // cal from price of courses
  const subtotal = order?.items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0
  const calculateDiscountAmount = () => {
    if (!order?.discount) return 0

    if (order.discount.type === 'Percent') {
      const discountPercent = (subtotal * order.discount.value) / 100
      return order.discount.maxDiscount ? Math.min(discountPercent, order.discount.maxDiscount) : discountPercent
    } else {
      return order.discount.value
    }
  }

  const discountAmount = calculateDiscountAmount()

  const statusBlock = (() => {
    if (order.status === OrderStatus.Completed) {
      return (
        <div className='flex flex-col items-center text-center gap-4'>
          <div className='bg-transparent rounded-full p-4'>
            <img src={successIcon} alt='Payment success' className='w-28 h-28 md:w-48 md:h-48 object-contain' />
          </div>
          <h2 className='text-2xl font-semibold'>Cảm ơn bạn đã mua hàng</h2>
          <p className='text-sm text-gray-600 md:max-w-96'>
            Bạn có thể truy cập khóa học trong mục Khóa học của tôi để có thể bắt đầu học tập ngay bây giờ. Chúng tôi sẽ
            gửi email xác nhận đơn hàng cho bạn sớm nhất có thể.
          </p>
          <div className='my-4 text-sm text-gray-500'>
            Mã đơn hàng:
            <span className='font-medium text-gray-800'> {id}</span>
          </div>
        </div>
      )
    }

    if (order.status === OrderStatus.Pending) {
      return (
        <div className='flex flex-col items-center text-center gap-4'>
          <div className='bg-transparent rounded-full p-4'>
            <img src={pendingIcon} alt='Payment success' className='w-28 h-28 md:w-48 md:h-48 object-contain' />
          </div>
          <h2 className='text-2xl font-semibold'>Đơn hàng đang được xử lý</h2>
          <p className='text-sm text-gray-600 md:max-w-96'>
            Hệ thống của chúng tôi đang xử lý đơn hàng. Vui lòng chờ trong khi chúng tôi hoàn tất thanh toán và kích
            hoạt khoá học cho bạn.
          </p>
          <div className='text-sm text-gray-500'>
            Nếu sau <span className='font-semibold'>1 giờ</span> đơn hàng vẫn chưa hoàn tất, vui lòng liên hệ bộ phận hỗ
            trợ để được kiểm tra và xử lý.
          </div>
          <div className='my-4 text-sm text-gray-500'>
            Mã đơn hàng:
            <span className='font-medium text-gray-800'> {id}</span>
          </div>
        </div>
      )
    }

    return (
      <div className='flex flex-col items-center text-center gap-4'>
        <div className='bg-transparent rounded-full p-4'>
          <img src={failIcon} alt='Payment failed' className='w-28 h-28 md:w-48 md:h-48 object-contain' />
        </div>
        <h2 className='text-2xl font-semibold'>Thanh toán không thành công !</h2>
        <p className='text-sm text-gray-600 md:max-w-96'>
          Thanh toán không thành công. Vui lòng thử lại hoặc kiểm tra lại phương thức thanh toán của bạn. Nếu tiền đã bị
          trừ, liên hệ bộ phận hỗ trợ để được kiểm tra và hoàn tiền trong vòng 3–5 ngày làm việc.
        </p>
        <div className='my-4 text-sm text-gray-500'>
          Mã đơn hàng:
          <span className='font-medium text-gray-800'> {id}</span>
        </div>
      </div>
    )
  })()

  return (
    <div className='flex items-center justify-center'>
      <div className='max-w-3xl w-full p-8 rounded-xl'>
        {statusBlock}
        <Card className='border border-gray-100 shadow-sm rounded-xl mt-8'>
          <CardHeader className='pb-2 pt-4'>
            <CardTitle className='text-xs flex items-center gap-1 text-gray-400 font-normal'>
              <Info className='w-4 h-4' />
              Thông tin đơn hàng của bạn
            </CardTitle>
          </CardHeader>
          <CardContent className='pb-4'>
            <div className='bg-gray-50/50 rounded-lg px-4 border border-gray-50'>
              <div className='items order-items'>
                {order?.items.map((item, index) => (
                  <div
                    key={index}
                    className='flex justify-between text-sm mb-2 py-4 border-b border-gray-100 last:border-0'
                  >
                    <div className='flex items-center gap-3 font-medium'>
                      <img
                        src={item.image}
                        alt={item.title}
                        className='w-10 h-10 object-cover rounded-md shadow-sm border border-gray-100'
                      />
                      <span>
                        <p className='text-gray-900'>{item.title}</p>
                        <p className='font-normal text-xs text-gray-500 mt-0.5'>@{item.instructor_name}</p>
                      </span>
                    </div>
                    <span className='font-medium text-gray-800 flex items-center'>
                      {formatCurrency(item.price)} VNĐ
                    </span>
                  </div>
                ))}
              </div>
              <div className='py-3 flex items-center justify-between border-t border-gray-100 mt-2'>
                <div className='text-sm text-gray-500'>Tạm tính</div>
                <div className='text-sm font-semibold text-gray-800'>{formatCurrency(subtotal)}</div>
              </div>
              {order?.discount && (
                <>
                  <div className='mt-2 flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-100/50'>
                    <div className='flex items-center gap-2'>
                      <span className='text-sm font-medium text-green-700'>Mã giảm: {order.discount.code}</span>
                      <span className='text-xs bg-green-100/80 text-green-700 px-2 py-0.5 rounded-sm'>
                        {order.discount.type === 'Percent' ? `${order.discount.value}%` : 'Cố định'}
                      </span>
                    </div>
                    <div className='text-sm font-semibold text-green-700'>-{formatCurrency(discountAmount)}</div>
                  </div>
                  <div className='mt-3 flex items-center justify-between pt-3 pb-2'>
                    <div className='text-sm font-semibold text-gray-700'>Tổng cộng</div>
                    <div className='text-lg font-bold text-blue-600'>{formatCurrency(order?.total)}</div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>

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

export default OrderSuccess
