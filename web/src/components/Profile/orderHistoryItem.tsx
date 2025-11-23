import { HistoryOrder } from '@/types/order-history'
import { Item, ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import formatPrice from '@/utils/common/formatPrice'
import CustomButton from '@/components/common/Button'
import { Send } from 'lucide-react'
import OrderDetail from './order-detail'
import CustomDialog from '@/components/common/Dialog'
import { useState } from 'react'

const OrderHistoryItem = ({ item }: { item: HistoryOrder }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const handleOpenDialog = () => {
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
  }

  return (
    <Item className='hover:bg-gray-100 transition-colors duration-200 shadow-sm'>
      <ItemMedia className='w-56 flex-shrink-0 pr-6'>
        <div className='flex items-center'>
          <div className='flex -space-x-3 items-center'>
            {item.items.slice(0, 3).map((orderItem, idx) => (
              <div key={orderItem.course_id} className='relative' style={{ zIndex: 10 + idx }}>
                <Avatar className='w-12 h-12 ring-2 ring-white border border-white'>
                  <AvatarImage src={orderItem.image} alt={orderItem.course_name} />
                  <AvatarFallback>{orderItem.course_name?.charAt(0) ?? '?'}</AvatarFallback>
                </Avatar>
              </div>
            ))}

            {item.items.length > 3 && (
              <div className='relative' style={{ zIndex: 1 }}>
                <Avatar className='w-12 h-12 bg-muted text-muted-foreground border border-white'>
                  <AvatarFallback>+{item.items.length - 3}</AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>

          <div className='ml-4 min-w-0'>
            <p className='text-sm font-medium'>
              Mã số:{' '}
              <span className='inline-block max-w-40 truncate align-middle' title={item.id}>
                {item.id}
              </span>
            </p>
            <p className='text-xs text-muted-foreground'>{item.items.length} khóa học</p>
          </div>
        </div>
      </ItemMedia>
      <ItemContent className='flex-1 flex flex-col justify-center items-center'>
        <ItemTitle>Tổng cộng: {formatPrice(item.total)}</ItemTitle>
        <ItemDescription className='justify-start'>
          Ngày đặt hàng {new Date(item.created_at).toLocaleDateString()}
        </ItemDescription>
      </ItemContent>
      <ItemActions className='flex items-center'>
        <CustomButton
          label='Xem chi tiết'
          className='bg-gray-100 text-black hover:bg-gray-200'
          icon={<Send className='w-4 h-4' />}
          onClick={handleOpenDialog}
        />
      </ItemActions>
      <CustomDialog
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        // eslint-disable-next-line react/no-children-prop
        children={
          <>
            <OrderDetail orderId={item.id} />
          </>
        }
        title={
          <>
            <Send className='w-5 h-5' /> Chi tiết đơn hàng
          </>
        }
      />
    </Item>
  )
}

export default OrderHistoryItem
