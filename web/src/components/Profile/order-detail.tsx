import { Card, CardContent } from '@/components/ui/card'
import { Order } from '@/types/order.type'
import formatPrice from '@/utils/common/formatPrice'
import { useEffect, useState } from 'react'
import orderService from '@/services/sale/order.service'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip'
import { User, Crown } from 'lucide-react'
import OrderDetailSkeleton from './order-detail-skeleton'

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
    return <OrderDetailSkeleton />
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
            {/* Customer info - boxed with overlapping label */}
            <div className='relative my-4'>
              <div className='absolute -top-3 left-4 bg-gray-200 px-2 rounded text-sm font-medium flex items-center shadow-sm'>
                <User className='mr-1 w-4 h-4' />
                <span>Thông tin khách hàng</span>
              </div>
              <div className='border rounded-lg p-4 pt-6 bg-white'>
                <div>
                  <div className='text-sm font-medium'>{order.customer_name}</div>
                  <div className='text-xs text-muted-foreground'>Email đã nhận hóa đơn: {order.customer_email}</div>
                </div>
              </div>
            </div>
            {order.type === 'VIP_SUBSCRIPTION' ? (
              <div className='flex items-center gap-4 bg-yellow-50 p-4 rounded-xl border border-yellow-200 shadow-sm'>
                <div className='flex items-center justify-center bg-yellow-400 rounded-full w-12 h-12 shadow-sm'>
                  <Crown className='w-6 h-6 text-white' />
                </div>
                <div>
                  <h3 className='font-bold text-yellow-900 text-base'>
                    {order.vip_package?.name || 'Gói Hội Viên VIP'}
                  </h3>
                  <p className='text-sm text-yellow-700 font-medium'>
                    {order.vip_package?.description || `Thời hạn: ${order.vip_package?.duration_months || 1} tháng`}
                  </p>
                </div>
                <div className='ml-auto font-bold text-base text-yellow-800'>{formatPrice(order.total)}</div>
              </div>
            ) : (
              <div className='items order-items'>
                {order?.items.map((item, index) => (
                  <div key={index} className='flex justify-between text-sm mb-2 py-4 rounded-md border-b last:border-0'>
                    <div className='flex items-center gap-2 font-medium'>
                      <img src={item.image} alt={item.title} className='w-12 h-12 object-cover rounded-md' />
                      <span>
                        <p className='text-base'>{item.title}</p>
                        <p className='font-normal text-muted-foreground'>Giảng viên: {item.instructor_name}</p>
                      </span>
                    </div>
                    <span className='font-semibold'>{formatPrice(item.price)}</span>
                  </div>
                ))}
              </div>
            )}

            {Number(discountAmount) > 0 && order.type !== 'VIP_SUBSCRIPTION' && (
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
