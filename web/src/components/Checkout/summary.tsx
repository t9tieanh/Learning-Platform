import { BadgeCheckIcon, BanknoteArrowDown, DollarSign, MousePointer } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import CustomButton from '@/components/common/Button'
import CustomInput from '@/components/common/Input'
import { Badge } from '@/components/ui/badge'
import { Order } from '@/types/order.type'
import orderService from '@/services/sale/order.service'
import { toast } from 'sonner'
import { useState, useMemo } from 'react'
import useLoading from '@/hooks/useLoading.hook'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

const OrderSummary = ({ order, setOrder }: { order: Order | null; setOrder: (order: Order | null) => void }) => {
  const [codeInput, setCodeInput] = useState('')
  const { loading, startLoading, stopLoading } = useLoading()

  // format number to VNĐ style
  const formatCurrency = (v: number) => v.toLocaleString('vi-VN')

  // compute subtotal and discount amount based on discount.type and maxDiscount
  const { subtotal, discountAmount, discountDisplay, discountDetail, totalAfterDiscount } = useMemo(() => {
    const items = order?.items || []
    const sub = items.reduce((s, it) => s + (it.price || 0), 0)

    const disc = order?.discount
    if (!disc) {
      return { subtotal: sub, discountAmount: 0, discountDisplay: '', discountDetail: '', totalAfterDiscount: sub }
    }

    let discAmount = 0
    if (disc.type === 'Percent') {
      discAmount = Math.round((sub * (disc.value || 0)) / 100)
    } else {
      // Amount
      discAmount = disc.value || 0
    }

    // apply maxDiscount cap when provided
    if (typeof disc.maxDiscount === 'number') {
      discAmount = Math.min(discAmount, disc.maxDiscount)
    }

    const displayAmount = `- ${formatCurrency(discAmount)} VNĐ`

    const detail =
      disc.type === 'Percent'
        ? `Giảm ${disc.value}% trên tổng ${formatCurrency(sub)} → ${formatCurrency(discAmount)} VNĐ${
            disc.maxDiscount ? ` (tối đa ${formatCurrency(disc.maxDiscount)} VNĐ)` : ''
          }`
        : `Giảm trực tiếp ${formatCurrency(discAmount)} VNĐ${
            disc.maxDiscount ? ` (tối đa ${formatCurrency(disc.maxDiscount)} VNĐ)` : ''
          }`

    const total = Math.max(0, sub - discAmount)

    return {
      subtotal: sub,
      discountAmount: discAmount,
      discountDisplay: displayAmount,
      discountDetail: detail,
      totalAfterDiscount: total
    }
  }, [order])

  const handleApplyDiscount = async (code: string) => {
    try {
      startLoading()
      const response = await orderService.applyDiscount(code)
      if (response.code === 200 && response.result && response.result) {
        toast.success(response.message)
        setOrder(response.result)
      } else {
        toast.error(response.message || 'Áp dụng mã giảm giá thất bại')
      }
      setCodeInput('')
    } catch (error) {
      toast.error('Áp dụng mã giảm giá thất bại')
    } finally {
      stopLoading()
    }
  }

  return (
    <div className='payment-form'>
      <Card className='shadow-sm'>
        <CardHeader>
          <CardTitle className='font-semibold text-base flex items-center gap-2'>
            <BanknoteArrowDown /> Hóa đơn của bạn
          </CardTitle>
          <CardDescription>Thông tin chi tiết về đơn hàng của bạn.</CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='items order-items'>
            {order?.items.map((item, index) => (
              <div key={index} className='flex justify-between text-sm mb-2 py-4 shadow-sm rounded-md pb-2'>
                <div className='flex items-center gap-2 font-medium'>
                  <img src={item.image} alt={item.title} className='w-8 h-8 object-cover rounded-md' />
                  <span>
                    <p>{item.title}</p>
                    <p className='font-normal text-gray-800'>@{item.instructor_name}</p>
                  </span>
                </div>
                <span>{item.price} VNĐ</span>
              </div>
            ))}
          </div>
          <div className='discount-area'>
            <div className='discount flex items-end justify-between font-medium text-sm border-gray-300'>
              <CustomInput
                label='Mã giảm giá'
                placeholder='Nhập mã giảm giá'
                className='w-72 mr-2'
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
              />
              <CustomButton
                label='Áp dụng'
                className='px-4 bg-blue-600 text-white hover:bg-blue-700'
                icon={<MousePointer className='w-4 h-4 ml-1' />}
                onClick={() => handleApplyDiscount(codeInput)}
                isLoader={loading}
              />
            </div>
            <div className='applied-discount w-full flex justify-end'>
              {order?.discount?.code && (
                <Badge className='text-sm mt-2 flex items-center gap-2'>
                  <BadgeCheckIcon size={32} />
                  <span>
                    Mã giảm giá <span className='font-semibold italic ml-1'>{order.discount.code}</span>
                  </span>

                  {discountAmount > 0 && (
                    <Popover>
                      <PopoverTrigger>
                        <CustomButton
                          className='ml-3 text-white-600 font-semibold bg-transparent hover:opacity-90 transition px-2 py-1 rounded'
                          aria-label='Chi tiết mã giảm giá'
                          label={discountDisplay}
                        />
                      </PopoverTrigger>
                      <PopoverContent side='top' align='start' className='w-64 p-3'>
                        <div className='text-sm text-gray-700'>
                          <div className='font-medium mb-1'>Chi tiết mã giảm giá</div>
                          <div>{discountDetail}</div>
                          <div className='mt-2 text-xs text-gray-500'>Áp dụng trên các sản phẩm trong đơn</div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
        <hr />
        <CardFooter>
          <div className='flex justify-between font-medium text-base gap-2'>
            <span className='flex items-center gap-1'>
              <DollarSign className='w-5' /> Tổng cộng:
            </span>
            <span className='text-red-700 font-semibold'>{formatCurrency(totalAfterDiscount)} VNĐ</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default OrderSummary
