import { CiDiscount1 } from 'react-icons/ci'
import CustomButton from '@/components/common/Button'
import { GrLinkNext } from 'react-icons/gr'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trash, MousePointer2 } from 'lucide-react'
import { CourseCart } from '@/types/cart.type'
import { toast } from 'sonner'
import { Dispatch, SetStateAction } from 'react'
import orderService from '@/services/sale/order.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'

const OrderDetail = ({
  order,
  setCourseSelected
}: {
  order: CourseCart
  setCourseSelected: Dispatch<SetStateAction<CourseCart[]>>
}) => {
  const handleRemove = () => {
    setCourseSelected((prev) => prev.filter((item) => item.id !== order.id))
  }

  return (
    <>
      <h4 className='font-semibold text-gray-600 text-sm flex items-center gap-2 p-2'>
        <Avatar>
          <AvatarImage src={order.thumbnail_url} alt='User Avatar' />
          <AvatarFallback>{order.title}</AvatarFallback>
        </Avatar>
        {order.title}
      </h4>
      <div className='flex align-center justify-between mt-1 py-2'>
        <div>
          <span className='text-sm text-gray-500'>₫{order?.final_price.toLocaleString()}</span>
          &nbsp;
          <span className='text-sm text-gray-500 line-through'>₫{order?.original_price.toLocaleString()}</span>
        </div>
        <CustomButton
          icon={<Trash />}
          className='hover:text-red-500 hover:bg-gray-100 bg-red-500 h-10 w-10'
          onClick={handleRemove}
        />
      </div>
      <hr />
    </>
  )
}

const CheckoutSummary = ({
  selectedCourses,
  setCourseSelected
}: {
  selectedCourses: CourseCart[]
  setCourseSelected: Dispatch<SetStateAction<CourseCart[]>>
}) => {
  const { data } = useAuthStore()
  const navigate = useNavigate()

  const handleCheckout = async () => {
    if (!data?.accessToken) {
      toast.error('Vui lòng đăng nhập để thanh toán đơn hàng này !')
      return
    }

    if (!selectedCourses || selectedCourses.length === 0) {
      toast.error('Vui lòng chọn ít nhất một khóa học để đặt hàng.')
      return
    }

    // Proceed to checkout process
    const response = await orderService.createOrder(selectedCourses.map((course) => course.id))

    if (response.code === 200 && response.message) {
      toast.success(response.message || 'Tạo đơn hàng thành công !, Vui lòng hoàn thành đơn hàng này !')
      navigate('/check-out')
    } else {
      toast.error(response.message || 'Có lỗi trong quá trình đặt hàng ! Vui lòng thử lại.')
    }
  }

  return (
    <div className='border-gray-300 border-1 shadow-sm rounded-xl p-4 bg-white'>
      <div className='checkout-title'>
        <p className='text-base font-semibold mb-1 flex items-center'>&nbsp;Tổng tiền</p>
        <hr />
      </div>
      <div className='mt-3 p-1'>
        <div className='flex items-center justify-between p-2 font-bold text-xl text-orange-500'>
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
            <OrderDetail key={index} order={order} setCourseSelected={setCourseSelected} />
          ))}
        </div>
        <div>
          <CustomButton
            icon={<GrLinkNext />}
            label='Đặt hàng'
            className='bg-blue-500 hover:bg-blue-600 text-white w-full'
            onClick={handleCheckout}
          />
          <CustomButton
            icon={<MousePointer2 />}
            label='Nhập mã giảm giá'
            className='bg-green-600 hover:bg-yellow- text-white w-full mt-1'
          />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
