import { CourseListItem } from '@/types/course-user'
import { Star, Send } from 'lucide-react'
import { useState, useEffect } from 'react'
import CustomButton from '@/components/common/Button'
import feedbackService from '@/services/notification/feedback.service'
import { toast } from 'sonner'
import useLoading from '@/hooks/useLoading.hook'

const AddFeedback = ({ courseItem, onClose }: { courseItem: CourseListItem; onClose: () => void }) => {
  const [rating, setRating] = useState<number>(0)
  const [message, setMessage] = useState<string>('')
  const { loading, startLoading, stopLoading } = useLoading()
  const [isUpdate, setIsUpdate] = useState(false)

  useEffect(() => {
    // reset state when courseItem changes
    setRating(0)
    setMessage('')

    const fetchMyFeedback = async () => {
      const response = await feedbackService.getFeedbackByUserAndCourse(courseItem.id)
      if (response && response.code === 200) {
        setRating(response.result?.rating as number)
        setMessage(response.result?.message || '')
        if (response.result?.message?.trim() !== '') {
          setIsUpdate(true)
        }
      }
    }

    fetchMyFeedback()
  }, [courseItem])

  const submitFeedback = async () => {
    // Basic validation
    if (!rating) {
      // you can replace with UI feedback
      toast.error('Vui lòng chọn số sao')
      return
    }

    try {
      startLoading()
      const response = await feedbackService.addFeedBack(courseItem.id, rating, message)
      if (response && response.code === 200) {
        toast.success(response.message || 'Gửi đánh giá thành công')
        onClose()
      } else {
        toast.error(response.message || 'Gửi đánh giá thất bại. Vui lòng thử lại sau.')
        return
      }
    } catch (error: any) {
      toast.error(error.response.data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.')
    } finally {
      stopLoading()
    }
  }

  return (
    <div className='w-full'>
      <div className='flex gap-4 mb-4'>
        <img src={courseItem.thumbnailUrl} className='w-24 h-16 object-cover rounded' alt={courseItem.title} />
        <div>
          <div className='font-semibold'>{courseItem.title}</div>
          <div className='text-sm text-muted-foreground'>{courseItem.shortDescription}</div>
        </div>
      </div>

      <div className='mb-4'>
        <div className='flex items-center justify-center gap-2 mb-2'>
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type='button'
              aria-label={`Rate ${s}`}
              onClick={() => setRating(s)}
              className={`p-1 ${s <= rating ? 'text-yellow-500' : 'text-gray-300'}`}
            >
              <Star className={`w-5 h-5 ${s <= rating ? 'fill-yellow-400' : ''}`} />
            </button>
          ))}
        </div>
        <div className='text-sm text-center text-muted-foreground'>Chọn số sao và viết nhận xét của bạn</div>
      </div>

      <div className='mb-4'>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          className='w-full border border-border rounded p-2 resize-none text-sm'
          placeholder='Viết nhận xét của bạn ở đây...'
        />
      </div>

      <div className='flex justify-end gap-2'>
        <CustomButton onClick={onClose} className='bg-gray-100 hover:bg-gray-200 text-black' label='Hủy' />
        <CustomButton
          onClick={submitFeedback}
          label={isUpdate ? `Cập nhật đánh giá` : `Gửi đánh giá`}
          icon={<Send size={16} />}
          isLoader={loading}
        />
      </div>
    </div>
  )
}

export default AddFeedback
