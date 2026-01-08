import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import CustomButton from '@/components/common/Button'
import { Trash2, MousePointer2 } from 'lucide-react'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { CourseCart } from '@/types/cart.type'
import cartService from '@/services/sale/cart.service'
import { toast } from 'sonner'
import { Dispatch, SetStateAction } from 'react'
import { useCartStore } from '@/stores/useCart.stores'
import formatPrice from '@/utils/common/formatPrice'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'

const CartItemCard = ({
  cardItem,
  fetchCartItems,
  setCourseSelected
}: {
  cardItem: CourseCart
  fetchCartItems: () => void
  setCourseSelected?: Dispatch<SetStateAction<CourseCart[]>>
}) => {
  const refresh = useCartStore((s) => s.refresh)
  const handleRemoveFromCart = async () => {
    // Show confirmation toast
    const confirmed = await showConfirmToast({
      title: 'Xóa khóa học khỏi giỏ hàng?',
      description: `Bạn có chắc muốn xóa "${cardItem.title}" khỏi giỏ hàng?`,
      confirmLabel: 'Có, xóa',
      cancelLabel: 'Hủy'
    })

    // If user cancels, return early
    if (!confirmed) return

    try {
      const response = await cartService.removeFromCart(cardItem.id)
      if (response.code === 200 && response.message) {
        toast.success(response.message)
        // run both updates in parallel to speed up completion
        await Promise.all([fetchCartItems(), refresh()])
      } else {
        toast.error(response.message || 'Chưa thể xóa khóa học khỏi giỏ hàng')
      }
    } catch (error: any) {
      toast.error(error?.message || 'Chưa thể xóa khóa học khỏi giỏ hàng')
      console.error('Error removing cart item:', error)
    }
  }

  const handleSelectCourse = async () => {
    // Append the selected course to parent's selected list (keep existing + new)
    setCourseSelected?.((prev = []) => {
      // avoid duplicates by id
      const exists = prev.some((c) => c.id === cardItem.id)
      if (exists) return prev
      return [...prev, cardItem]
    })
  }

  return (
    <Card className='cart-item-card text-gray-600 flex flex-col md:flex-row gap-4 p-4 mt-3 border-none'>
      <img
        src={cardItem?.thumbnail_url}
        alt={cardItem?.title}
        className='w-full md:w-[200px] h-[150px] md:h-[120px] object-cover rounded'
      />
      <div className='flex flex-col md:flex-row justify-between flex-1 text-sm gap-4 md:gap-2'>
        <div>
          <CardTitle className='text-base md:text-lg neutral-800 line-clamp-2'>{cardItem.title}</CardTitle>
          <CardDescription>
            <div className='flex items-center py-2'>
              <Avatar className='w-5 h-5 mr-1'>
                <AvatarImage src={cardItem?.instructor?.image} alt={cardItem?.title} />
                <AvatarFallback>{cardItem?.instructor.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className='teacher-name'>{cardItem?.instructor.name}</p>
            </div>
            <div className='rating flex items-center gap-1'>
              <p className='rating-count font-bold text-yellow-600'>{cardItem?.rating}</p>
              <Rating defaultValue={cardItem?.rating} readOnly>
                {Array.from({ length: 5 }).map((_, index) => (
                  <RatingButton size={16} className='w-5 text-yellow-600' key={index} />
                ))}
              </Rating>
            </div>
          </CardDescription>
        </div>
        <div className='flex md:flex-col items-center md:items-end justify-between md:justify-start gap-4 md:gap-2'>
          <div className='text-right'>
            <CardDescription className='text-orange-500 font-semibold text-base'>
              {formatPrice(cardItem.final_price)}
            </CardDescription>
            {cardItem.original_price && (
              <CardDescription className='line-through text-sm'>{formatPrice(cardItem.original_price)}</CardDescription>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <CustomButton
              icon={<MousePointer2 size={18} />}
              className='hover:bg-blue-800 p-2 w-10 h-10'
              onClick={handleSelectCourse}
            />
            <CustomButton
              icon={<Trash2 size={18} />}
              className='bg-red-500 hover:bg-red-800 p-2 w-10 h-10'
              onClick={handleRemoveFromCart}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CartItemCard
