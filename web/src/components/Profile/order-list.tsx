import orderService from '@/services/sale/order.service'
import { useEffect, useState } from 'react'
import { HistoryOrder } from '@/types/order-history'
import OrderHistoryItem from './orderHistoryItem'

const OrderList = () => {
  const [orders, setOrders] = useState<HistoryOrder[]>([])

  useEffect(() => {
    const fetchOrderHistory = async () => {
      const response = await orderService.getOrderHistory()
      if (response.code === 200 && response.result) {
        setOrders(response.result)
      }
    }

    fetchOrderHistory()
  }, [])

  return (
    <div className='cart-section pb-5 px-5 bg-white rounded-lg'>
      <div className='total-cart-item'>
        <p className='text-sm font-semibold mb-1 flex items-center'>
          Bạn đã thanh toán &nbsp;<span className='text-primary'>{orders?.length || 0}</span>&nbsp; đơn hàng !
        </p>
        <hr />
      </div>
      <div className='cart-item flex flex-col p-4 gap-4 min-h-[750px]'>
        {orders.length === 0 ? (
          <p className='text-center text-muted-foreground text-sm'>Bạn chưa có đơn hàng nào.</p>
        ) : (
          orders.map((order) => (
            <>
              <OrderHistoryItem key={order.id} item={order} />
            </>
          ))
        )}
      </div>
    </div>
  )
}

export default OrderList
