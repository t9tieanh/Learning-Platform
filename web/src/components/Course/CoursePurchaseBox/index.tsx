import CustomButton from '@/components/common/Button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FaPaperPlane, FaShoppingCart, FaTag } from 'react-icons/fa'
import { useState } from 'react'
import cartService from '@/services/sale/cart.service'
import { toast } from 'sonner'
import { useCartStore } from '@/stores/useCart.stores'
import orderService from '@/services/sale/order.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'

const CoursePurchaseBox = ({
  originalPrice,
  finalPrice,
  courseId
}: {
  originalPrice: number
  finalPrice: number
  courseId: string
}) => {
  const [discountCode, setDiscountCode] = useState('')
  const refresh = useCartStore((s) => s.refresh)
  const { data } = useAuthStore()
  const navigator = useNavigate()

  const handleAddToCart = async () => {
    try {
      const response = await cartService.addToCart(courseId)
      if (response && response.code === 200) {
        toast.success(response.message || 'Thêm vào giỏ hàng thành công!')
        await refresh()
      } else {
        toast.error(response.message || 'Không thể thêm vào giỏ hàng')
      }
    } catch (error) {
      toast.error('Không thể thêm vào giỏ hàng')
      console.error('Error adding to cart:', error)
    }
  }

  // handle payment process
  const handlePayment = async () => {
    try {
      if (!data?.accessToken) {
        toast.error('Vui lòng đăng nhập để tiếp tục thanh toán.')
        return
      }
      const response = await orderService.createOrder([courseId])
      if (response && response.code === 200 && response.result) {
        // Redirect to payment page
        toast.success('Tạo đơn hàng thành công !')
        navigator('/check-out')
      } else {
        toast.error(response.message || 'Không thể khởi tạo đơn hàng. Vui lòng thử lại.')
      }
    } catch (error) {
      toast.error('Không thể khởi tạo đơn hàng. Vui lòng thử lại.')
      console.error('Error processing payment:', error)
    }
  }

  return (
    <div className='flex justify-center min-h-screen bg-gradient-to-br py-8'>
      <div className='w-full max-w-md'>
        <Card
          className='sticky bg-gradient-card shadow-lg border-0 rounded-2xl overflow-hidden backdrop-blur-sm'
          style={{ top: 'calc(var(--main-header-height, 64px) + 100px)' }}
        >
          <CardHeader className='pb-4'>
            {/* Price Section */}
            <div className='text-center space-y-3'>
              <div className='flex items-center justify-center gap-3'>
                <span className='text-3xl font-bold text-course-price text-blue-800'>₫{finalPrice}</span>
                <span className='text-lg text-gray-400 line-through'>₫{originalPrice}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3 pt-2'>
              <CustomButton
                className='w-full h-12 text-base'
                icon={<FaPaperPlane className='w-4 h-4' />}
                label='Mua ngay'
                onClick={handlePayment}
              />

              <CustomButton
                className='w-full h-12 text-base bg-red-500 hover:bg-red-600 text-white'
                icon={<FaShoppingCart className='w-4 h-4' />}
                label='Thêm vào giỏ hàng'
                onClick={handleAddToCart}
              />
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            {/* Discount Code Section */}
            <div className='bg-muted/30 rounded-xl p-4 space-y-4'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <FaTag className='w-4 h-4 text-primary' />
                <span className='font-medium'>Nhập mã giảm giá (nếu có)</span>
              </div>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Nhập mã giảm giá để nhận ưu đãi đặc biệt cho khóa học này.
              </p>
              <div className='flex gap-2'>
                <Input
                  placeholder='Nhập mã giảm giá'
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className='flex-1 border-primary/20 focus:border-primary'
                />
                <CustomButton className='px-4 bg-blue-500 hover:bg-blue-600 text-white' label='Áp dụng' />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CoursePurchaseBox
