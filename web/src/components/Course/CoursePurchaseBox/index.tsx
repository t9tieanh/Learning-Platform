import './style.scss'
import Button from '@/components/common/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FaPaperPlane, FaShoppingCart } from 'react-icons/fa'
import { GiClick } from 'react-icons/gi'
// eslint-disable-next-line import/no-unresolved
import CustomInput from '@/components/common/Input'
import CustomCard from '@/components/common/Card'
import { MdDiscount } from 'react-icons/md'

const CoursePurchaseBox = () => {
  return (
    <div className='flex justify-center course-purchase-container'>
      <div className='z-50 mx-auto' style={{ minHeight: '1000px', position: 'relative' }}>
        <Card className='max-w-sm mt-6 ml-auto sticky top-10 right-5 z-50 shadow-md gap-1'>
          <CardHeader>
            <CardTitle className='font-medium text-2xl'>
              <div className='flex items-center justify-between p-2'>
                ₫279,000 VND
                <div>
                  <span className='line-through font-normal text-sm text-gray-500'>₫300,000</span>
                  &nbsp;
                  <span className='text-sm'>7% giảm</span>
                </div>
              </div>
              <p className='text-sm text-red-600 text-light text-center'>Thời gian ưu đãi còn lại: 2 ngày 3 giờ</p>
            </CardTitle>
            <div className='mb-3'>
              <Button
                label='Mua ngay'
                variant={'destructive'}
                icon={<FaPaperPlane />}
                className='w-full h-12 bg-red-700'
              />
              <Button
                label='Thêm vào giỏ hàng'
                icon={<FaShoppingCart />}
                className='w-full mt-2 h-12'
                variant={'outline'}
              />
            </div>
          </CardHeader>
          <CardContent>
            <CustomCard
              className='mt-0'
              icon={<MdDiscount size={20} />}
              title='Nhập mã giảm giá (nếu có)'
              description='Nhập mã giảm giá để nhận ưu đãi đặc biệt cho khóa học này.'
              content={
                <>
                  <div className='flex gap-2'>
                    <CustomInput placeholder='Nhập mã giảm giá' />
                    <Button icon={<GiClick />} label='Áp dụng' className='bg-indigo-950' />
                  </div>
                </>
              }
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CoursePurchaseBox
