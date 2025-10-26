import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FaPaperPlane, FaShoppingCart, FaTag, FaClock } from 'react-icons/fa'
import { useState } from 'react'

const CoursePurchaseBox = () => {
  const [discountCode, setDiscountCode] = useState('')

  return (
    <div className='flex justify-center min-h-screen bg-gradient-to-br py-8'>
      <div className='w-full max-w-md'>
        <Card className='sticky top-8 bg-gradient-card shadow-lg border-0 rounded-2xl overflow-hidden backdrop-blur-sm'>
          <CardHeader className='pb-4'>
            {/* Price Section */}
            <div className='text-center space-y-3'>
              <div className='flex items-center justify-center gap-3'>
                <span className='text-3xl font-bold text-course-price text-blue-800'>₫279,000</span>
                <span className='text-lg text-gray-400 line-through'>₫300,000</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className='space-y-3 pt-2'>
              <Button size='lg' className='w-full h-12 text-base'>
                <FaPaperPlane className='w-4 h-4' />
                Mua ngay
              </Button>

              <Button variant='outline' size='lg' className='w-full h-12 text-base text-primary'>
                <FaShoppingCart className='w-4 h-4' />
                Thêm vào giỏ hàng
              </Button>
            </div>
          </CardHeader>

          <CardContent className='pt-0'>
            {/* Discount Code Section */}
            <div className='bg-muted/30 rounded-xl p-4 space-y-4'>
              <div className='flex items-center gap-2 text-muted-foreground'>
                <FaTag className='w-4 h-4 text-primary' />
                <span className='font-medium'>Nhập mã giảm giá (nếu có)</span>
              </div>
              <p className='text-sm text-muted-foreground leading-relaxed'>
                Nhập mã giảm giá để nhận ưu đãi đặc biệt cho khóa học này.
              </p>
              <div className='flex gap-2'>
                <Input
                  placeholder='Nhập mã giảm giá'
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  className='flex-1 border-primary/20 focus:border-primary'
                />
                <Button className='px-4 bg-red-500 hover:bg-red-600 text-white'>Áp dụng</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CoursePurchaseBox
