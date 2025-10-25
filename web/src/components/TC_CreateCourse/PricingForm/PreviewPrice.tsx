import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'

const PreviewPrice = ({
  earnings,
  coursePrice
}: {
  earnings: {
    instructor: string
    udemy: string
  }
  coursePrice: number
}) => {
  return (
    <div>
      <Card className='border border-blue-200 shadow-sm bg-blue-50'>
        <CardHeader className='bg-blue-200/40 rounded-t-lg'>
          <CardTitle className='text-lg font-medium text-blue-900 flex items-center space-x-2'>
            <TrendingUp className='h-5 w-5 text-blue-600' />
            <span>Phân tích thu nhập</span>
          </CardTitle>
          <p className='text-sm text-blue-700'>Ước tính thu nhập cho mỗi lượt bán</p>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200'>
              <span className='text-base text-green-900'>Thu nhập của bạn</span>
              <span className='text-base font-semibold text-green-700'>{earnings.instructor.toLocaleString()} VNĐ</span>
            </div>

            <div className='flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200'>
              <span className='text-base text-yellow-600'>Phí nền tảng</span>
              <span className='text-base font-semibold text-yellow-600'>{earnings.udemy.toLocaleString()} VNĐ</span>
            </div>

            <div className='flex justify-between items-center p-3 bg-blue-200/30 rounded-lg border border-blue-300'>
              <span className='text-base text-blue-900'>Học viên trả</span>
              <span className='text-base font-semibold text-blue-800'>{coursePrice.toLocaleString()} VNĐ</span>
            </div>
          </div>

          <div className='pt-4 border-t border-blue-200'>
            <h4 className='text-lg font-bold mb-2 text-blue-900'>Chi tiết chia sẻ doanh thu</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-blue-700'>Giảng viên nhận</span>
                <span className='font-medium text-blue-900'>63%</span>
              </div>
              <div className='flex justify-between'>
                <span className='text-blue-700'>Phí nền tảng</span>
                <span className='font-medium text-blue-900'>37%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PreviewPrice
