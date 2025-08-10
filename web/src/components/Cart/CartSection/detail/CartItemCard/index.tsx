import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Car } from 'lucide-react'

interface CartItemCardProps {
  title: string
  teacherName: string
  image: string
  basePrice?: number
  price: number
}

const CartItemCard = ({ cardItem }: { cardItem: CartItemCardProps }) => {
  return (
    <Card className='cart-item-card flex flex-row gap-4 items-center p-4'>
      <img src={cardItem.image} alt={cardItem.title} className='w-16 h-16 object-cover rounded' />
      <div className='flex justify-between flex-1'>
        <div>
          <CardTitle>{cardItem.title}</CardTitle>
          <CardDescription>Giáo viên: {cardItem.teacherName}</CardDescription>
        </div>
        <div>
          <CardDescription>Giá: {cardItem.price} VNĐ</CardDescription>
          {cardItem.basePrice && <CardDescription className='line-through'>{cardItem.basePrice} VNĐ</CardDescription>}
        </div>
      </div>
    </Card>
  )
}

export default CartItemCard
