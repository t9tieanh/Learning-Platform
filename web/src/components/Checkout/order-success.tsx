import { HouseHeart, Info } from 'lucide-react'
import Countdown from 'react-countdown'
import { useNavigate } from 'react-router-dom'
import CustomButton from '@/components/common/Button'
import successIcon from '@/assets/images/success-icon.gif'
import failIcon from '@/assets/images/fail-icon.gif'
import pendingIcon from '@/assets/images/pending-icon.webp'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Order, OrderStatus } from '@/types/order.type'

const formatCurrency = (v?: number) => (v ?? 0).toLocaleString('vi-VN') + ' VNĐ'

const OrderSuccess = ({ order, id }: { order: Order; id: string }) => {
  const navigate = useNavigate()

  // Tính tạm tính từ tổng giá các khóa học
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
    <div className='my-5 flex items-center justify-center'>
      <div className='max-w-3xl w-full p-8 rounded-xl'>
        {statusBlock}
        <Card className='border-none shadow-0'>
          <CardHeader>
            <CardTitle className='text-sm flex items-center gap-1'>
              <Info className='w-4 h-4' />
              Thông tin đơn hàng của bạn !
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='bg-gray-50 rounded-lg px-4'>
              <div className='items order-items'>
                {order?.items.map((item, index) => (
                  <div key={index} className='flex justify-between text-sm mb-2 py-4 rounded-md'>
                    <div className='flex items-center gap-2 font-medium'>
                      <img src={item.image} alt={item.title} className='w-8 h-8 object-cover rounded-md' />
                      <span>
                        <p>{item.title}</p>
                        <p className='font-normal text-gray-800'>@{item.instructor_name}</p>
                      </span>
                    </div>
                    <span>{formatCurrency(item.price)} VNĐ</span>
                  </div>
                ))}
              </div>
              <div className='mt-4 flex items-center justify-between'>
                <div className='text-sm text-gray-600'>Tạm tính</div>
                <div className='text-lg font-semibold text-gray-800'>{formatCurrency(subtotal)}</div>
              </div>
              {order?.discount && (
                <div className='mt-3 flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200'>
                  <div className='flex items-center gap-2'>
                    <span className='text-sm font-medium text-green-700'>Mã giảm: {order.discount.code}</span>
                    <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>
                      {order.discount.type === 'Percent' ? `${order.discount.value}%` : 'Cố định'}
                    </span>
                  </div>
                  <div className='text-sm font-semibold text-green-700'>-{formatCurrency(discountAmount)}</div>
                </div>
              )}
              <div className='mt-4 flex items-center justify-between border-t pt-4'>
                <div className='text-sm font-semibold text-gray-700'>Tổng cộng</div>
                <div className='text-xl font-bold text-blue-600'>{formatCurrency(order?.total)}</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className='mt-6 flex justify-center'>
          <CustomButton
            onClick={() => navigate('/')}
            label={
              <Countdown
                date={Date.now() + 5 * 60 * 1000}
                onComplete={() => navigate('/')}
                renderer={({ minutes, seconds, completed }) => {
                  if (completed) {
                    navigate('/')
                    return <div>Quay về trang chủ</div>
                  }
                  const mm = String(minutes).padStart(2, '0')
                  const ss = String(seconds).padStart(2, '0')
                  return (
                    <div className='flex flex-col items-center'>
                      <span>
                        Quay về trang chủ sau <span className='font-bold'>{`${mm}:${ss}`}</span>
                      </span>
                    </div>
                  )
                }}
              />
            }
            icon={<HouseHeart className='h-5 w-5' />}
            className='px-6 py-2 rounded-md border border-gray-200 hover:shadow-lg shadow-md'
          />
        </div>
      </div>
    </div>
  )
}

export default OrderSuccess
