import { BanknoteArrowDown } from 'lucide-react'

const OrderSummary = () => {
  const orderDetails = {
    items: [
      { id: 1, name: 'Product 1', price: 100 },
      { id: 2, name: 'Product 2', price: 200 }
    ],
    total: 300
  }

  return (
    <div className='p-4 bg-white rounded-lg'>
      <h2 className='text-lg font-semibold flex items-center mb-4 gap-2'>
        <BanknoteArrowDown /> Hóa đơn của bạn
      </h2>
      <div className='mt-4 space-y-2'>
        {orderDetails.items.map((item) => (
          <div key={item.id} className='flex justify-between text-sm'>
            <span>{item.name}</span>
            <span>{item.price} VNĐ</span>
          </div>
        ))}
        <div className='border-t border-gray-200 pt-2'>
          <div className='flex justify-between font-semibold text-base'>
            <span>Tổng cộng</span>
            <span>{orderDetails.total} VNĐ</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrderSummary
