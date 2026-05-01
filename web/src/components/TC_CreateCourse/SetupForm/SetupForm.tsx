import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckSquare, CheckCircle } from 'lucide-react'
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

import SetupFormSkeleton from './Skeleton/SetupFormSkeleton'

const SetupForm = ({ id }: { id: string }) => {
  const [overviewCourse, setOverviewCourse] = useState<{
    lessonNum: number
    videoDuration: number
    courseId: string
    finalPrice: string
  }>()

  const { loading, startLoading, stopLoading } = useLoading()
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    const getCourseOverview = async () => {
      setInitialLoading(true)
      try {
        const response = await courseService.getCourseOverview(id)
        if (response && response.code === 200 && response.result) {
          setOverviewCourse(response.result)
        } else toast.error('Không thể tải tóm tắt khóa học')
      } catch (error) {
        console.log('Error fetching course overview:', error)
      } finally {
        setInitialLoading(false)
      }
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

  if (initialLoading) {
    return <SetupFormSkeleton />
  }

  return (
    <div className='max-w-7xl w-full mx-auto space-y-12 px-4 sm:px-6 md:px-8 py-10 md:py-12 rounded-[48px] bg-[#f8fafc] border-2 border-white shadow-sm'>
      <TitleComponent
        title='Xem lại và hoàn tất'
        icon={<CheckCircle className='h-6 w-6 text-white' />}
        description='Kiểm tra lại toàn bộ nội dung, cấu hình chính sách và các bài giảng trước khi gửi yêu cầu kiểm duyệt để xuất bản khóa học lên hệ thống.'
      />

      <div className='gap-8'>
        <div className='space-y-6'>
          <Card className='border-2 border-white ring-1 ring-gray-100 shadow-sm bg-white rounded-[32px] overflow-hidden'>
            <CardHeader className='pb-4 border-b border-gray-50/50'>
              <CardTitle className='text-[15px] font-bold text-gray-900 flex gap-2.5 items-center'>
                <div className='p-2 bg-blue-50/50 rounded-xl text-blue-600 border border-blue-50'>
                  <CheckSquare className='h-4 w-4' />
                </div>
                <span>Tóm tắt khóa học</span>
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-6 pt-6'>
              <div className='grid grid-cols-3 gap-4'>
                <div className='text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:border-blue-100 group'>
                  <div className='text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors'>{overviewCourse?.lessonNum}</div>
                  <div className='text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1'>Bài giảng</div>
                </div>

                <div className='text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:border-blue-100 group'>
                  <div className='text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors'>
                    {formatDuration(overviewCourse?.videoDuration || 0)}
                  </div>
                  <div className='text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1'>Thời lượng</div>
                </div>

                <div className='text-center p-4 bg-gray-50/50 rounded-2xl border border-gray-100 transition-all hover:bg-white hover:border-blue-100 group'>
                  <div className='text-xl font-black text-gray-900 group-hover:text-blue-600 transition-colors'>{formatPrice(overviewCourse?.finalPrice)}</div>
                  <div className='text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1'>Mức giá</div>
                </div>
              </div>

              <div className='flex justify-center pt-4'>
                <CustomButton
                  className='bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-12 h-11 font-bold shadow-xl shadow-blue-100 transition-all active:scale-95'
                  label='Gửi yêu cầu kiểm duyệt ngay'
                  icon={<BsSendCheckFill className='h-4 w-4 mr-2' />}
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
