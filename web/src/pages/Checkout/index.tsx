import Banner from '@/components/Checkout/baner'
import PaymentForm from '@/components/Checkout/paymentForm'
import OrderSummary from '@/components/Checkout/summary'
import TimeToLive from '@/components/Checkout/timetolive'
import orderService from '@/services/sale/order.service'
import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { Order } from '@/types/order.type'
import OrderSuccess from '@/components/Checkout/order-success'

const CheckoutPage = () => {
  const navigate = useNavigate()
  const [order, setOrder] = useState<Order | null>(null)
  const [mode, setMode] = useState<'view' | 'pay'>('pay')
  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        let response = null
        if (!id) {
          // get current order
          response = await orderService.getOrder()
          if (response && response.code === 200 && response.result) {
            setOrder(response.result)
            setMode('pay')
          } else if (response && response.message) {
            toast.error(response.message || 'Không thể lấy thông tin đơn hàng.')
            navigate('/')
          }
        } else {
          // get id for show page notify success order
          response = await orderService.getOrderInfo(id)
          if (response && response.code === 200 && response.result) {
            setOrder(response.result)
            setMode('view')
            return
          } else {
            toast.error('Đơn hàng này đã hết hạn thanh toán !')
            navigate('/')
            return
          }
        }
      } catch (error) {
        toast.error('Không thể lấy thông tin đơn hàng.')
        navigate('/')
      }
    }

    fetchOrderData()
  }, [])

  return (
    <div className='bg-gray-50'>
      {order && id && mode === 'view' ? (
        <OrderSuccess order={order} id={id as string} />
      ) : (
        <>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
            <Banner />
            {order?.ttl && <TimeToLive ttl={order.ttl} />}
            <div className='py-5 grid grid-cols-1 md:grid-cols-5 items-start min-h-[60vh] gap-6'>
              <div className='md:col-span-3'>
                <PaymentForm order={order} />
              </div>
              <div className='md:col-span-2'>
                <OrderSummary order={order} setOrder={setOrder} />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default CheckoutPage
