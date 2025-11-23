import { Card, CardContent } from '@/components/ui/card'
import { Order } from '@/types/order.type'
import formatPrice from '@/utils/common/formatPrice'
import { useEffect, useState } from 'react'
import orderService from '@/services/sale/order.service'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { User } from 'lucide-react'

const OrderDetail = ({ orderId }: { orderId: string }) => {
  const [order, setOrder] = useState<Order | null>(null)
  useEffect(() => {
    const fetchOrderDetail = async () => {
      const response = await orderService.getOrderInfo(orderId)
      if (response.code === 200 && response.result) {
        setOrder(response.result)
      }
    }

    fetchOrderDetail()
  }, [orderId])

  if (!order) {
    return <p>Đang tải chi tiết đơn hàng...</p>
  }

  const subtotal = order?.items?.reduce((sum, item) => sum + (item.price || 0), 0) || 0
  const calculateDiscountAmount = () => {
    if (!order?.discount) return 0

    if (order.discount.type === 'Percent') {
      const discountPercent = (subtotal * order.discount.value) / 100
      return order.discount.maxDiscount ? Math.min(discountPercent, order.discount.maxDiscount) : discountPercent
    } else {
      return order.discount.value
    }
  }

  const discountAmount = calculateDiscountAmount()

  const discountExplanation = (() => {
    if (!order?.discount) return ''
    if (order.discount.type === 'Percent') {
      const percent = order.discount.value
      const raw = (subtotal * percent) / 100
      const capped = order.discount.maxDiscount ? Math.min(raw, order.discount.maxDiscount) : raw
      const maxText = order.discount.maxDiscount ? formatPrice(order.discount.maxDiscount) : 'không có'
      return (
        'Giảm ' +
        percent +
        '% của ' +
        formatPrice(subtotal) +
        ' = ' +
        formatPrice(raw) +
        '; giới hạn tối đa ' +
        maxText +
        ', áp dụng ' +
        formatPrice(capped) +
        '.'
      )
    }

    return `Giảm cố định ${formatPrice(order.discount.value)}.`
  })()

  return (
    <>
      <Card className='border-none p-0 m-0'>
        <CardContent className='p-0'>
          <div className='rounded-lg'>
            {/* Customer info */}
            <div className='text-sm font-medium flex items-center'>
              <User className='mr-1 w-4 h-4' />
              <span>Thông tin khách hàng</span>
            </div>
            <div className='mb-4 pb-4 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3'>
              <div>
                <div className='text-sm font-medium'>{order.customer_name}</div>
                <div className='text-xs text-muted-foreground'>{order.customer_email}</div>
                <div className='text-xs text-muted-foreground'>User ID: {order.user_id}</div>
              </div>
            </div>
            <div className='items order-items'>
              {order?.items.map((item, index) => (
                <div key={index} className='flex justify-between text-sm mb-2 py-4 rounded-md'>
                  <div className='flex items-center gap-2 font-medium'>
                    <img src={item.image} alt={item.title} className='w-8 h-8 object-cover rounded-md' />
                    <span>
                      <p>{item.title}</p>
                      <p className='font-normal text-gray-800'>@{item.instructor_name}</p>
                    </span>
                  </div>
                  <span>{formatPrice(item.price)} VNĐ</span>
                </div>
              ))}
            </div>
            {Number(discountAmount) > 0 && (
              <div className='mt-4 flex items-center justify-between'>
                <div className='text-sm text-gray-600'>Tạm tính</div>
                <div className='text-lg font-semibold text-gray-800'>{formatPrice(subtotal)}</div>
              </div>
            )}
            {order?.discount && (
              <div className='mt-3 flex items-center justify-between bg-green-50 p-3 rounded-md border border-green-200'>
                <div className='flex items-center gap-2'>
                  <span className='text-sm font-medium text-green-700'>Mã giảm: {order.discount.code}</span>
                  <span className='text-xs bg-green-100 text-green-700 px-2 py-1 rounded'>
                    {order.discount.type === 'Percent' ? `${order.discount.value}%` : 'Cố định'}
                  </span>
                </div>
                <TooltipProvider delayDuration={200}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className='text-sm font-semibold text-green-700 cursor-help'>
                        -{formatPrice(discountAmount)}
                      </div>
                    </TooltipTrigger>
                    <TooltipContent sideOffset={6} className='max-w-xs'>
                      <p className='text-sm leading-relaxed'>{discountExplanation}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            )}
            <div className='mt-4 flex items-center justify-between border-t pt-4'>
              <div className='text-sm font-semibold text-gray-700'>Tổng cộng</div>
              <div className='text-xl font-bold text-blue-600'>{formatPrice(order?.total)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default OrderDetail
