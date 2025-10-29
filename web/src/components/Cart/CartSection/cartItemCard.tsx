import { Card, CardDescription, CardTitle } from '@/components/ui/card'
import Button from '@/components/common/Button'
import { Trash2, MousePointer2 } from 'lucide-react'
import { Rating, RatingButton } from '@/components/ui/shadcn-io/rating'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CartItemCardProps {
  title: string
  teacherName: string
  image: string
  basePrice?: number
  price: number
  rating?: number
}

const CartItemCard = ({ cardItem }: { cardItem: CartItemCardProps }) => {
  return (
    <Card className='cart-item-card text-gray-600 flex flex-col md:flex-row gap-4 p-4 mt-3 border-none'>
      <img
        src={cardItem?.image}
        alt={cardItem?.title}
        className='w-full md:w-[200px] h-[150px] md:h-[120px] object-cover rounded'
      />
      <div className='flex flex-col md:flex-row justify-between flex-1 text-sm gap-4 md:gap-2'>
        <div>
          <CardTitle className='text-base md:text-lg neutral-800 line-clamp-2'>{cardItem.title}</CardTitle>
          <CardDescription>
            <div className='flex items-center py-2'>
              <Avatar className='w-5 h-5 mr-1'>
                <AvatarImage src={cardItem?.image} alt={cardItem?.title} />
                <AvatarFallback>{cardItem?.teacherName.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className='teacher-name'>{cardItem?.teacherName}</p>
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
            <CardDescription className='text-red-500 font-semibold text-base'>{cardItem.price} VNĐ</CardDescription>
            {cardItem.basePrice && (
              <CardDescription className='line-through text-sm'>{cardItem.basePrice} VNĐ</CardDescription>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              icon={<MousePointer2 size={18} />}
              className='bg-slate-200 hover:bg-slate-50 hover:text-blue-500 p-2'
            />
            <Button icon={<Trash2 size={18} />} className='bg-slate-200 hover:bg-slate-50 hover:text-red-500 p-2' />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CartItemCard
