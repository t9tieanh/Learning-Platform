import { CiDiscount1 } from 'react-icons/ci'
import CustomButton from '@/components/common/Button'
import { GrLinkNext } from 'react-icons/gr'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trash, MousePointer2 } from 'lucide-react'
import { CourseCart } from '@/types/cart.type'

const OrderDetail = ({ order }: { order: CourseCart }) => {
  return (
    <>
      <h4 className='font-semibold mb-5 text-gray-600 text-sm flex items-center gap-2 p-2'>
        <Avatar>
          <AvatarImage src={order.thumbnail_url} alt='User Avatar' />
          <AvatarFallback>{order.title}</AvatarFallback>
        </Avatar>
        {order.title}
      </h4>
      <div className='flex align-center justify-between mt-1 py-2'>
        <div>
          <span className='text-sm text-gray-500'>₫{order?.original_price.toLocaleString()}</span>
          &nbsp;
          <span className='text-sm text-gray-500 line-through'>₫{order?.final_price.toLocaleString()}</span>
        </div>
        <CustomButton icon={<Trash />} className='hover:text-red-500 hover:bg-gray-100 bg-red-500' />
      </div>
      <hr />
    </>
  )
}

const CheckoutSummary = ({ selectedCourses }: { selectedCourses?: CourseCart[] }) => {
  return (
    <div className='p-3 border-gray-300 border-1 shadow-sm rounded-xl p-4 bg-white'>
      <div className='checkout-title'>
        <p className='text-base font-semibold mb-1 flex items-center'>
          <CiDiscount1 />
          &nbsp;Tổng tiền
        </p>
        <hr />
      </div>
      <div className='mt-3 p-1'>
        <div className='flex items-center justify-between p-2 font-bold text-xl'>
          ₫{selectedCourses?.reduce((sum, o) => sum + o.final_price, 0).toLocaleString('vi-VN')} VND
          <div>
            <span className='line-through font-normal text-sm text-gray-500'>
              ₫{selectedCourses?.reduce((sum, o) => sum + o.original_price, 0).toLocaleString('vi-VN')}
            </span>
          </div>
        </div>
        <hr />
        <div className='order-detail'>
          {selectedCourses?.map((order, index) => (
            <OrderDetail key={index} order={order} />
          ))}
        </div>
        <div>
          <CustomButton
            icon={<GrLinkNext />}
            label='Đặt hàng'
            className='bg-blue-500 hover:bg-blue-600 text-white w-full'
          />
          <CustomButton
            icon={<MousePointer2 />}
            label='Nhập mã giảm giá'
            className='bg-red-500 hover:bg-red-600 text-white w-full mt-1'
          />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
