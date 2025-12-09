import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import formatPrice from '@/utils/common/formatPrice'

const PreviewPrice = ({
  coursePrice,
  yourIncome,
  platformFee
}: {
  coursePrice: number
  yourIncome: number
  platformFee: number
}) => {
  return (
    <div>
      <Card className='shadow-lg bg-white'>
        <CardHeader className='bg-blue-200/40 rounded-t-lg'>
          <CardTitle className='text-lg font-medium text-blue-900 flex items-center space-x-2'>
            <TrendingUp className='h-5 w-5 text-blue-600' />
            <span>Phân tích thu nhập</span>
          </CardTitle>
          <p className='text-sm text-blue-700'>Ước tính thu nhập cho mỗi lượt bán</p>
        </CardHeader>

        <CardContent className='space-y-4'>
          <div className='space-y-3'>
            <div className='flex justify-between items-center p-3 bg-blue-200/30 rounded-lg border shadow-md'>
              <span className='text-base text-blue-900'>Học viên trả</span>
              <span className='text-base font-semibold text-blue-800'>{formatPrice(coursePrice * 1000)}</span>
            </div>
            <div className='flex justify-between items-center p-3 bg-yellow-50 rounded-lg shadow-md'>
              <span className='text-base text-yellow-600'>Phí nền tảng</span>
              <span className='text-base font-semibold text-yellow-600'>
                {platformFee && (platformFee * 100).toLocaleString()} %
              </span>
            </div>
          </div>

          <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg shadow-md'>
            <span className='text-base text-green-900'>Thu nhập của bạn</span>
            <span className='text-base font-semibold text-green-700'>{(yourIncome * 1000)?.toLocaleString()} VNĐ</span>
          </div>

          <div className='pt-4 border-t border-blue-200'>
            <h4 className='text-lg font-bold mb-2 text-blue-900'>Chi tiết chia sẻ doanh thu</h4>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between'>
                <span className='text-blue-700'>Giảng viên nhận</span>
                <span className='font-medium text-blue-900'>
                  {platformFee && ((1 - platformFee) * 100).toLocaleString()} %
                </span>
              </div>
              <div className='flex justify-between'>
                <span className='text-blue-700'>Phí nền tảng</span>
                <span className='font-medium text-blue-900'>
                  {platformFee && (platformFee * 100).toLocaleString()} %
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PreviewPrice
