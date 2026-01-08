import Banner from './banner'
import OrderList from './order-list'

const OrderHistory = () => {
  return (
    <div className='bg-white shadow-lg border-1 border-gray-200 rounded-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        <Banner name='Lịch sử đơn hàng' description='Xem lịch sử đơn hàng của bạn' />
        <div className='order-list'>
          <OrderList />
        </div>
      </div>
    </div>
  )
}

export default OrderHistory
