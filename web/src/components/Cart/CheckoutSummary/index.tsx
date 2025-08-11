import { CiDiscount1 } from 'react-icons/ci'
import CustomButton from '@/components/common/Button'
import { GrLinkNext } from 'react-icons/gr'
import './style.scss'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Trash } from 'lucide-react'

interface OrderDetailProps {
  title: string
  basePrice: number
  price: number
  image?: string
}

const OrderDetail = ({ order }: { order: OrderDetailProps }) => {
  return (
    <>
      <h4 className='font-semibold mb-5 text-sm flex items-center gap-2 p-2'>
        <Avatar>
          <AvatarImage src={order.image} alt='User Avatar' />
          <AvatarFallback>{order.title}</AvatarFallback>
        </Avatar>
        {order.title}
      </h4>
      <div className='flex align-center justify-between mt-1 py-2'>
        <div>
          <span className='text-sm text-gray-500'>₫{order.basePrice.toLocaleString()}</span>
          &nbsp;
          <span className='text-sm text-gray-500 line-through'>₫{order.price.toLocaleString()}</span>
        </div>
        <CustomButton icon={<Trash />} variant={'icon'} className='hover:text-red-500' />
      </div>
      <hr />
    </>
  )
}

const CheckoutSummary = () => {
  const orderDetails = [
    {
      title: 'Khóa học JavaScript cơ bản và nâng cao cho người mới bắt đầu',
      basePrice: 200000,
      price: 150000,
      image: 'https://fnbstudy.vn/wp-content/uploads/2025/04/baner-Web-scaled.jpg'
    },
    {
      title: 'Làm chủ JavaScript ES6+ và ứng dụng thực tế trong dự án web hiện đại',
      basePrice: 300000,
      price: 250000,
      image: 'https://files.fullstack.edu.vn/f8-prod/courses/7.png'
    },
  ]

  return (
    <div className='p-3 checkout-section'>
      <div className='checkout-title'>
        <p className='text-lg font-semibold mb-1 flex items-center'>
          <CiDiscount1 />
          &nbsp;Tổng tiền
        </p>
        <hr />
      </div>
      <div className='mt-3'>
        <div className='flex items-center justify-between p-2 font-bold text-2xl'>
          ₫279,000 VND
          <div>
            <span className='line-through font-normal text-sm text-gray-500'>₫300,000</span>
          </div>
        </div>
        <hr />
        <div className='order-detail'>
          {orderDetails.map((order, index) => (
            <OrderDetail key={index} order={order} />
          ))}
        </div>
        <div>
          <CustomButton
            icon={<GrLinkNext />}
            label='Đặt hàng'
            className='bg-blue-500 hover:bg-blue-600 text-white w-full'
          />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
