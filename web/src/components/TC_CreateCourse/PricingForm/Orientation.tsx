import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle } from 'lucide-react'

const Orientation = () => {
  return (
    <Card className='border border-blue-200 shadow-sm bg-blue-50'>
      <CardHeader className='bg-blue-200/40 rounded-t-lg'>
        <CardTitle className='text-lg font-medium text-blue-900'>Mẹo chiến lược định giá</CardTitle>
      </CardHeader>

      <CardContent className='space-y-4'>
        <div className='space-y-3'>
          <div className='flex items-start space-x-3'>
            <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
            <div>
              <h4 className='font-medium text-sm text-blue-900'>Nghiên cứu đối thủ</h4>
              <p className='text-xs text-blue-700'>Xem các khóa học tương tự để tìm mức giá hợp lý</p>
            </div>
          </div>

          <div className='flex items-start space-x-3'>
            <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
            <div>
              <h4 className='font-medium text-sm text-blue-900'>Bắt đầu với khuyến mãi</h4>
              <p className='text-xs text-blue-700'>Dùng giảm giá để thu hút học viên và đánh giá ban đầu</p>
            </div>
          </div>

          <div className='flex items-start space-x-3'>
            <CheckCircle className='h-5 w-5 text-green-600 mt-0.5' />
            <div>
              <h4 className='font-medium text-sm text-blue-900'>Thử nhiều mức giá</h4>
              <p className='text-xs text-blue-700'>Bạn có thể điều chỉnh giá sau khi ra mắt dựa trên hiệu quả</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default Orientation
