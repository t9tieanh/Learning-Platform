import { Sigma } from 'lucide-react'
import CartItemCard from './cartItemCard'
import { useEffect, useState, Dispatch, SetStateAction, type FC } from 'react'
import cartService from '@/services/sale/cart.service'
import { CourseCart } from '@/types/cart.type'

const CardSection: FC<{ setCourseSelected?: Dispatch<SetStateAction<CourseCart[]>> }> = ({ setCourseSelected }) => {
  const [cartItems, setCartItems] = useState<CourseCart[]>([])

  const fetchCartItems = async () => {
    try {
      const response = await cartService.getCartItems()
      if (response.code === 200 && response.result) {
        setCartItems(response?.result)
      } else {
        throw new Error(response.message || 'Failed to fetch cart items')
      }
    } catch (error) {
      console.error('Error fetching cart items:', error)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  return (
    <div className='cart-section p-5 bg-white rounded-lg min-h-95 md:min-h-[480px] shadow-sm'>
      <div className='total-cart-item'>
        <p className='text-sm font-semibold mb-1 flex'>
          <Sigma className='w-5 h-5' />
          Có
          <span className='text-orange-500 font-bold'>&nbsp;{cartItems?.length || 0}&nbsp;</span>khóa học trong giỏ hàng
          !
        </p>
        <hr />
      </div>
      <div className='cart-item flex flex-col'>
        {cartItems && cartItems.length > 0 ? (
          cartItems?.map((item, index) => (
            <CartItemCard
              key={item.id ?? index}
              cardItem={item}
              fetchCartItems={fetchCartItems}
              setCourseSelected={setCourseSelected}
            />
          ))
        ) : (
          <>
            <p className='text-center p-3 text-base text-gray-500'>Giỏ hàng của bạn đang trống</p>
          </>
        )}
      </div>
    </div>
  )
}

export default CardSection
