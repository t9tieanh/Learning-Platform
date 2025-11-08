import { HouseHeart, Info } from 'lucide-react'
import Countdown from 'react-countdown'
import { useNavigate } from 'react-router-dom'
import CustomButton from '@/components/common/Button'
import successIcon from '@/assets/images/success-icon.gif'
import { Order } from '@/types/order.type'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const formatCurrency = (v?: number) => (v ?? 0).toLocaleString('vi-VN') + ' VNĐ'

const OrderSuccess = ({ order, id }: { order: Order; id: string }) => {
  const navigate = useNavigate()

  return (
    <div className='my-5 flex items-center justify-center'>
      <div className='max-w-3xl w-full p-8 rounded-xl'>
        <div className='flex flex-col items-center text-center gap-4'>
          <div className='bg-transparent rounded-full p-4'>
            <img src={successIcon} alt='Payment success' className='w-28 h-28 md:w-48 md:h-48 object-contain' />
          </div>
          <h2 className='text-2xl font-semibold'>Cảm ơn bạn đã mua hàng</h2>
          <p className='text-sm text-gray-600 md:max-w-96'>
            Bạn có thể truy cập khóa học trong mục Khóa học của tôi để có thể bắt đầu học tập ngay bây giờ.
          </p>
          <div className='my-4 text-sm text-gray-500'>
            Mã đơn hàng:
            <span className='font-medium text-gray-800'> {id}</span>
          </div>
        </div>
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
                    <span>{item.price} VNĐ</span>
                  </div>
                ))}
              </div>
              <div className='mt-4 flex items-center justify-between'>
                <div className='text-sm text-gray-600'>Total</div>
                <div className='text-lg font-bold text-gray-800'>{formatCurrency(order?.total)}</div>
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
