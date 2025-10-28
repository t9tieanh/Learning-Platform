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
    <Card className='cart-item-card flex flex-row gap-4 items-center p-4 mt-3 border-none'>
      <img src={cardItem?.image} alt={cardItem?.title} className='max-w-80 max-h-80 object-cover rounded' />
      <div className='flex justify-between flex-1'>
        <div>
          <CardTitle className='max-w-80 font-bold text-base'>{cardItem.title}</CardTitle>
          <CardDescription>
            <div className='flex items-center teacher-section py-2'>
              <Avatar className='w-5 h-5 mr-1'>
                <AvatarImage src={cardItem?.image} alt={cardItem?.title} />
                <AvatarFallback>{cardItem?.teacherName.charAt(0)}</AvatarFallback>
              </Avatar>
              <p className='teacher-name'>{cardItem?.teacherName}</p>
            </div>
            <div className='rating flex'>
              <p className='rating-count font-bold text-yellow-600'>{cardItem?.rating}</p>
              <Rating defaultValue={cardItem?.rating} readOnly>
                {Array.from({ length: 5 }).map((_, index) => (
                  <RatingButton size={16} className='w-5 text-yellow-600' key={index} />
                ))}
              </Rating>
            </div>
          </CardDescription>
        </div>
        <div className='flex flex-col items-end'>
          <div>
            <CardDescription className='text-red-500 font-semibold'>{cardItem.price} VNĐ</CardDescription>
            {cardItem.basePrice && <CardDescription className='line-through'>{cardItem.basePrice} VNĐ</CardDescription>}
          </div>
          <div className='flex items-center gap-2 mt-2'>
            <Button icon={<MousePointer2 />} className='bg-slate-200 hover:bg-slate-50 hover:text-blue-500' />
            <Button icon={<Trash2 />} className='bg-slate-200 hover:bg-slate-50 hover:text-red-500' />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CartItemCard
