import './style.scss'
import { Sigma } from 'lucide-react'
import CartItemCard from './detail/CartItemCard'

const CardSection = () => {
  const cardItems = [
    {
      title: 'Course 1',
      teacherName: 'Teacher 1',
      image: 'https://fnbstudy.vn/wp-content/uploads/2025/04/baner-Web-scaled.jpg',
      basePrice: 200000,
      price: 150000
    },
    {
      title: 'Course 2',
      teacherName: 'Teacher 2',
      image: 'https://files.fullstack.edu.vn/f8-prod/courses/7.png',
      basePrice: 300000,
      price: 250000
    }
  ]

  return (
    <div className='cart-section p-2'>
      <div className='total-cart-item'>
        <p className='text-lg font-semibold mb-1 flex items-center'>
          <Sigma />
          Có
          <span className='text-red-400'>&nbsp;2&nbsp;</span>khóa học trong giỏ hàng !
        </p>
        <hr />
      </div>
      <div className='cart-item'>
        {cardItems.map((item, index) => (
          <CartItemCard key={index} cardItem={item} />
        ))}
      </div>
    </div>
  )
}

export default CardSection
