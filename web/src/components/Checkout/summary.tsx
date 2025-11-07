import { BanknoteArrowDown } from 'lucide-react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import CustomButton from '@/components/common/Button'
import CustomInput from '@/components/common/Input'

const OrderSummary = () => {
  const orderDetails = {
    items: [
      {
        id: 1,
        name: 'Học Java cùng sư phụ Tiến Anh',
        price: 100,
        image: 'https://files.fullstack.edu.vn/f8-prod/courses/15/62f13d2424a47.png',
        teacherName: 'Tiến Anh'
      },
      {
        id: 2,
        name: 'Học Python cùng chuyên gia John Doe',
        price: 200,
        image: 'https://files.fullstack.edu.vn/f8-prod/courses/19/66aa28194b52b.png',
        teacherName: 'John Doe'
      }
    ],
    total: 300
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
            {orderDetails.items.map((item) => (
              <div key={item.id} className='flex justify-between text-sm mb-2 py-4 shadow-sm rounded-md pb-2'>
                <div className='flex items-center gap-2 font-medium'>
                  <img src={item.image} alt={item.name} className='w-8 h-8 object-cover rounded-md' />
                  <span>
                    <p>{item.name}</p>
                    <p className='font-normal text-gray-800'>@{item.teacherName}</p>
                  </span>
                </div>
                <span>{item.price} VNĐ</span>
              </div>
            ))}
          </div>
          <div className='discount flex items-end justify-between font-medium text-sm border-b border-gray-300 py-3'>
            <CustomInput label='Mã giảm giá' placeholder='Nhập mã giảm giá' className='w-80 mr-2 flex-auto' />
            <CustomButton label='Áp dụng' className='px-4 bg-blue-600 text-white hover:bg-blue-700 flex-none' />
          </div>
        </CardContent>
        <CardFooter>
          <div className='flex justify-between font-medium text-base gap-2'>
            <span>Tổng cộng:</span>
            <span>{orderDetails.total} VNĐ</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default OrderSummary
