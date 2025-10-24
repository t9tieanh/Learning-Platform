import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, CheckSquare } from 'lucide-react'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import { useEffect, useState } from 'react'
import courseService from '@/services/course/course.service'
import { toast } from 'sonner'
import CustomButton from '@/components/common/Button'
import { BsSendCheckFill } from "react-icons/bs";
import { Send } from 'lucide-react';
import useLoading from '@/hooks/useLoading.hook'

const SetupForm = ({ id }: { id: string }) => {
  const [overviewCourse, setOverviewCourse] = useState<{
    lessonNum: number
    videoDuration: number
    courseId: string
    finalPrice: string
  }>()

  const { loading, startLoading, stopLoading } = useLoading()

  useEffect(() => {
    const getCourseOverview = async () => {
      const response = await courseService.getCourseOverview(id)
      if (response && response.code === 200 && response.result) {
        setOverviewCourse(response.result)
      } else toast.error('Không thể tải tóm tắt khóa học')
    }

    getCourseOverview()
  }, [id])

  const handleRequestApproval = async () => {
    try {
      startLoading()
      const response = await courseService.requestApproval(id)
      if (response && response.code === 200) {
        toast.success(response.message || 'Yêu cầu kiểm duyệt khóa học đã được gửi thành công!')
      } else {
        toast.error(response.message || 'Gửi yêu cầu kiểm duyệt thất bại. Vui lòng thử lại.')
      }
    } catch (error) {
      toast.error('Gửi yêu cầu kiểm duyệt thất bại. Vui lòng thử lại.')
    } finally {
      stopLoading()
    }
  }

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
              <CardTitle className='text-lg font-medium text-blue-900 flex gap-2 items-center'>
                <CheckSquare />
                Tóm tắt khóa học
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>{overviewCourse?.lessonNum}</div>
                  <div className='text-xs text-blue-700'>Bài giảng</div>
                </div>

                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>{overviewCourse?.videoDuration}</div>
                  <div className='text-xs text-blue-700'>Thời lượng</div>
                </div>

                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>{overviewCourse?.finalPrice} VND</div>
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
              <CardTitle className='text-lg font-medium text-blue-900 flex gap-1 items-center'><Send className='h-5 w-5' /> Sẵn sàng xuất bản?</CardTitle>
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

              <CustomButton
                className='w-full bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'
                label='Gửi yêu cầu kiểm duyệt và xuất bản khóa học'
                icon={<BsSendCheckFill className='h-5 w-5 ml-2' />}
                onClick={handleRequestApproval}
                isLoader={loading}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SetupForm
