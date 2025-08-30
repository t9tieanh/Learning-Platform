import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { FaPaperPlane, FaShoppingCart, FaTag, FaClock } from 'react-icons/fa'
import { useState } from 'react'
import CustomButton from '@/components/common/Button'
import { GiClick } from 'react-icons/gi'

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
              <div className='inline-flex items-center gap-2 bg-course-discount/10 text-course-discount px-3 py-1 rounded-full text-sm font-medium text-green-500 bg-green-100'>
                <FaTag className='w-3 h-3' />
                7% giảm giá
              </div>
            </div>

            {/* Countdown Timer */}
            <div className='bg-course-urgent/5 border border-course-urgent/20 rounded-xl p-3 text-center bg-red-100  text-red-600'>
              <div className='flex items-center justify-center gap-2 text-course-urgent mb-1'>
                <FaClock className='w-4 h-4' />
                <span className='text-sm font-medium'>Thời gian ưu đãi còn lại: 2 ngày 3 giờ</span>
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
            <div className='bg-white shadow-md rounded-xl p-4 space-y-4'>
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
                <CustomButton label='Áp dụng' icon={<GiClick className='w-4 h-4' />} disabled={!discountCode} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CoursePurchaseBox
