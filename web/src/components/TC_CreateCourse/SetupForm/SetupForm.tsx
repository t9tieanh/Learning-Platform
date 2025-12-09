import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare } from 'lucide-react'
import TitleComponent from '@/components/TC_CreateCourse/common/Title'
import { useEffect, useState } from 'react'
import courseService from '@/services/course/course.service'
import { toast } from 'sonner'
import showConfirmToast from '@/components/common/ShowConfirmToast'
import CustomButton from '@/components/common/Button'
import { BsSendCheckFill } from 'react-icons/bs'
import useLoading from '@/hooks/useLoading.hook'
import formatPrice from '@/utils/common/formatPrice'
import formatDuration from '@/utils/time/formatDuration.utils'

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
    const confirmed = await showConfirmToast({
      title: 'Xác nhận gửi yêu cầu kiểm duyệt?',
      description: 'Bạn sẽ gửi yêu cầu kiểm duyệt khóa học này đến quản trị viên.',
      confirmLabel: 'Xác nhận',
      cancelLabel: 'Hủy'
    })
    if (!confirmed) return
    startLoading()
    try {
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
              <div className='grid grid-cols-3 gap-4'>
                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>{overviewCourse?.lessonNum}</div>
                  <div className='text-xs text-blue-700'>Bài giảng</div>
                </div>

                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>
                    {formatDuration(overviewCourse?.videoDuration || 0)}
                  </div>
                  <div className='text-xs text-blue-700'>Thời lượng</div>
                </div>

                <div className='text-center p-3 bg-blue-100 rounded-lg'>
                  <div className='text-lg font-bold text-blue-900'>{formatPrice(overviewCourse?.finalPrice)}</div>
                  <div className='text-xs text-blue-700'>Giá</div>
                </div>
              </div>

              <div className='flex justify-end pt-2'>
                <CustomButton
                  className='bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow'
                  label='Gửi yêu cầu kiểm duyệt'
                  icon={<BsSendCheckFill className='h-5 w-5 ml-2' />}
                  onClick={handleRequestApproval}
                  isLoader={loading}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default SetupForm
