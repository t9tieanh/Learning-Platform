import { ShoppingCart } from 'lucide-react'
import './style.scss'

const Banner = () => {
  return (
    <div className='cart-banner px-4 py-6 rounded-xl bg-primary'>
      <p className='text-3xl font-bold flex text-white items-center'>
        <ShoppingCart className='cart-icon text-white w-8 h-8' />
        &nbsp;Giỏ hàng của bạn.
      </p>
      <p className='text-base flex items-center text-white mt-2'>
        &nbsp;Chốt đơn ngay hôm nay để nhận mức giá ưu đãi cực khủng - cơ hội chỉ đến một lần!
      </p>
    </div>
  )
}

export default Banner
