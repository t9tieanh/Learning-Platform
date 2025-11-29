import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, GripVertical, HelpCircle, Play, Trash2, Send, X, Eye } from 'lucide-react'
import { Chapter, Lesson } from '@/utils/create-course/curriculum'
import { useCallback, useState } from 'react'
import lessonService from '@/services/course/lesson.service'
import { toast } from 'sonner'
import showConfirmToast from '@/components/common/ShowConfirmToast'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import { MdEdit } from 'react-icons/md'
import PreviewTeacherLesson from './PreviewTeacherLesson'

const UpdateLessonSchema = yup.object({
  title: yup.string().required('Tiêu đề không được để trống').min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
})

type UpdateLessonFormValues = yup.InferType<typeof UpdateLessonSchema>

const LessonForm = ({
  key,
  lesson,
  setChapters
}: {
  key: number
  lesson: Lesson
  setChapters?: React.Dispatch<React.SetStateAction<Chapter[]>>
}) => {
  const [updateTitle, setUpdateTitle] = useState(false)
  const [preview, setPreview] = useState({
    openPreview: false,
    lesson: null as Lesson | null
  })
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UpdateLessonFormValues>({
    resolver: yupResolver(UpdateLessonSchema) as any,
    defaultValues: {
      title: lesson.title
    }
  })

  const updateLesson = async (data: UpdateLessonFormValues) => {
    const result = await lessonService.updateNameLesson({
      id: lesson.id,
      title: data.title
    })

    if (result && result.code === 200 && result.result) {
      if (setChapters) {
        setChapters((prevChapters) =>
          prevChapters.map((ch) => ({
            ...ch,
            lessons: ch.lessons.map((les: any) => (les.id === lesson.id ? { ...les, title: data.title } : les))
          }))
        )
      }
      setUpdateTitle(false)
      toast.success('Cập nhật tiêu đề bài giảng thành công')
    } else {
      toast.error(result?.message || 'Cập nhật tiêu đề bài giảng thất bại. Vui lòng thử lại.')
    }
  }
  const handleDelLesson = async (lessonId: string) => {
    const confirmed = await showConfirmToast({
      title: 'Xóa bài học',
      description: 'Bạn có chắc muốn xóa bài học này? Hành động không thể hoàn tác.',
      confirmLabel: 'Có, xóa',
      cancelLabel: 'Hủy'
    })

    if (!confirmed) return
    try {
      const res = await lessonService.delLesson(lessonId)
      if (res && res.code === 200) {
        if (setChapters) {
          setChapters((prevChapters) =>
            prevChapters.map((ch) => ({
              ...ch,
              lessons: ch.lessons.filter((les: { id: string }) => les.id !== lessonId)
            }))
          )
        }
        toast.success(res.message || 'Xoá bài giảng thành công')
      } else {
        toast.error(res?.message || 'Xoá bài giảng thất bại, vui lòng thử lại')
      }
    } catch (error) {
      toast.error('Xoá bài giảng thất bại, vui lòng thử lại')
    }
  }

  const getLectureIcon = useCallback((type: string) => {
    switch (type) {
      case 'video':
        return (
          <span className='flex items-center justify-center w-7 h-7 rounded-md bg-blue-100 text-blue-600'>
            <Play className='h-4 w-4' />
          </span>
        )
      case 'article':
        return (
          <span className='flex items-center justify-center w-7 h-7 rounded-md bg-amber-100 text-amber-600'>
            <FileText className='h-4 w-4' />
          </span>
        )
      case 'quiz':
        return (
          <span className='flex items-center justify-center w-7 h-7 rounded-md bg-purple-100 text-purple-600'>
            <HelpCircle className='h-4 w-4' />
          </span>
        )
      default:
        return (
          <span className='flex items-center justify-center w-7 h-7 rounded-md bg-gray-100 text-gray-600'>
            <Play className='h-4 w-4' />
          </span>
        )
    }
  }, [])

  return (
    <>
      <div key={key} className='flex shadow-sm items-center space-x-3 p-3 rounded-lg border border-blue-200'>
        <GripVertical className='h-4 w-4 text-blue-400' />
        {getLectureIcon(lesson.type)}
        <div className='flex-1'>
          {updateTitle ? (
            <form className='space-y-2' onSubmit={handleSubmit(updateLesson)}>
              <CustomInput placeholder='Nhập tiêu đề mới' type='text' {...register('title')} />
              {errors.title && <span className='text-red-500 text-xs'>{errors.title.message}</span>}
              <div className='flex gap-2'>
                <CustomButton
                  className='bg-blue-500 text-white hover:bg-blue-600 h-7'
                  label='Lưu'
                  type='submit'
                  icon={<Send className='h-3 w-3 ml-1' />}
                />
                <CustomButton
                  className='bg-gray-200 text-dark hover:bg-gray-300 h-7'
                  label='Hủy'
                  onClick={(e) => {
                    e.preventDefault()
                    setUpdateTitle(false)
                  }}
                  icon={<X className='h-3 w-3 ml-1' />}
                />
              </div>
            </form>
          ) : (
            <div className='group flex items-center'>
              <span className='font-medium text-sm'>{lesson.title || 'Bài giảng chưa có tiêu đề'}</span>
              <CustomButton
                className='opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gray-200 text-dark p-1 rounded-md shadow hover:bg-gray-100 flex items-center justify-center ml-2'
                icon={<MdEdit />}
                onClick={() => {
                  setUpdateTitle(true)
                }}
              />
            </div>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='secondary' className='capitalize bg-blue-100 text-blue-700'>
            {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Bài viết' : 'Quiz'}
          </Badge>
          <Button
            variant='ghost'
            size='icon'
            className='text-blue-500 hover:bg-blue-50'
            title='Xem chi tiết'
            onClick={() => {
              setPreview({ openPreview: true, lesson })
            }}
          >
            <Eye className='h-4 w-4' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='text-red-500 hover:bg-red-50'
            onClick={() => handleDelLesson(lesson.id)}
          >
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
      <PreviewTeacherLesson preview={preview} setPreview={setPreview} />
    </>
  )
}

export default LessonForm
