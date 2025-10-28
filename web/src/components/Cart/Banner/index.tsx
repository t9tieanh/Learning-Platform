import { ShoppingCart } from 'lucide-react'
import './style.scss'

const Banner = () => {
  return (
    <div className='cart-banner bg-[#0C356A] px-8 py-10'>
      <h1 className='text-3xl font-bold mb-4 text-white flex items-center'>
        <ShoppingCart className='cart-icon text-blue-400 w-8 h-8' />
        &nbsp;Giỏ hàng của bạn.
      </h1>
      <hr className='border-gray-300 my-2' />
      <p className='text-base flex items-center text-white mt-2'>
        &nbsp;Chốt đơn ngay hôm nay để nhận mức giá ưu đãi cực khủng – cơ hội chỉ đến một lần!
      </p>
    </div>
  )
}

export default Banner
