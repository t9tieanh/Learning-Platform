import './style.scss'
import { FaShoppingCart, FaFireAlt } from 'react-icons/fa'

const Banner = () => {
  return (
    <div className='cart-banner p-32'>
      <h1 className='text-4xl font-bold mb-4 text-black flex items-center'>
        <FaShoppingCart />
        &nbsp;Giỏ hàng của bạn !
      </h1>
      <p className='text-lg flex items-center text-black'>
        <FaFireAlt />
        &nbsp;Chốt đơn nhanh, giá đang rất hời.
      </p>
    </div>
  )
}

export default Banner
