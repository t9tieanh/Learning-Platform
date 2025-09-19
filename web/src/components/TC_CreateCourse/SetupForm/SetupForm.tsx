import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, AlertCircle } from 'lucide-react'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'

const SetupForm = () => {
  const setupChecklist = [
    {
      title: 'Nội dung khóa học đã được tải lên',
      description: 'Tất cả video và tài liệu đã sẵn sàng',
      completed: true,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Trang giới thiệu khóa học',
      description: 'Tiêu đề, mô tả và ảnh bìa đã được thiết lập',
      completed: true,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Cấu hình giá',
      description: 'Giá và khuyến mãi của khóa học đã được thiết lập',
      completed: true,
      icon: CheckCircle,
      color: 'text-green-600'
    },
    {
      title: 'Cài đặt khóa học',
      description: 'Cấu hình chính sách và tính năng của khóa học',
      completed: false,
      icon: AlertCircle,
      color: 'text-yellow-600'
    }
  ]

  return (
    <div className='max-w-6xl space-y-8 mx-auto'>
      <TitleComponent
        title='Xem lại và hoàn tất'
        description='Cấu hình cài đặt, chính sách và các tính năng tương tác cho khóa học. Hoàn thành mục này để có thể xuất bản
          khóa học.'
      />

      <div className='gap-8'>
        <div className='space-y-6'>
          <Card className='border border-blue-200 shadow-sm bg-blue-50'>
            <CardHeader className='bg-blue-200/40 rounded-t-lg'>
              <CardTitle className='text-lg font-medium text-blue-900'>Tóm tắt khóa học</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>15</div>
                  <div className='text-xs text-blue-700'>Bài giảng</div>
                </div>

                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>3.5h</div>
                  <div className='text-xs text-blue-700'>Thời lượng</div>
                </div>

                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>1.440.000 VNĐ</div>
                  <div className='text-xs text-blue-700'>Giá</div>
                </div>

                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>VN</div>
                  <div className='text-xs text-blue-700'>Ngôn ngữ</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className='border border-blue-200 shadow-sm bg-blue-50'>
            <CardHeader className='bg-blue-200/40 rounded-t-lg'>
              <CardTitle className='text-lg font-medium text-blue-900'>Sẵn sàng xuất bản?</CardTitle>
            </CardHeader>

            <CardContent className='space-y-4'>
              <div className='p-4 bg-green-100 border border-blue-200 rounded-lg'>
                <div className='flex items-start space-x-2'>
                  <CheckCircle className='h-4 w-4 text-green-600 mt-0.5' />
                  <div className='text-sm'>
                    <p className='font-medium text-green-900'>Gần xong rồi!</p>
                    <p className='text-green-700 mt-1'>Hoàn tất cài đặt khóa học để gửi kiểm duyệt.</p>
                  </div>
                </div>
              </div>

              <Button
                className='w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'
                size='lg'
                disabled={!setupChecklist.every((item) => item.completed)}
              >
                Gửi kiểm duyệt
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SetupForm
