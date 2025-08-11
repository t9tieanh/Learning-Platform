import './style.scss'
import { Sigma } from 'lucide-react'
import CartItemCard from './detail/CartItemCard'

const CardSection = () => {
  const cardItems = [
    {
      title: 'Khóa học JavaScript cơ bản và nâng cao cho người mới bắt đầu',
      teacherName: 'Teacher 1',
      image: 'https://fnbstudy.vn/wp-content/uploads/2025/04/baner-Web-scaled.jpg',
      basePrice: 200000,
      price: 150000,
      rating: 3
    },
    {
      title: 'Làm chủ JavaScript ES6+ và ứng dụng thực tế trong dự án web hiện đại',
      teacherName: 'Teacher 2',
      image: 'https://files.fullstack.edu.vn/f8-prod/courses/7.png',
      basePrice: 300000,
      price: 250000,
      rating: 4
    },
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
      <div className='cart-item flex flex-col'>
        {cardItems.map((item, index) => (
          <CartItemCard key={index} cardItem={item} />
        ))}
      </div>
    </div>
  )
}

export default CardSection
