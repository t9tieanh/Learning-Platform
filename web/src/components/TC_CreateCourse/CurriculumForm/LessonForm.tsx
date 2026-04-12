import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, GripVertical, HelpCircle, Play, Trash2, Send, X, Eye, Video, BookOpen } from 'lucide-react'
import { Chapter, Lesson, CreationLessonFormValues } from '@/utils/create-course/curriculum'
import { useCallback, useState } from 'react'
import lessonService from '@/services/course/lesson.service'
import { toast } from 'sonner'
import showConfirmToast from '@/components/common/ShowConfirmToast'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import CustomDialog from '@/components/common/Dialog'
import AddVideoForm from './AddVideoUpdated'
import { useChunkedUpload } from '@/hooks/useChunkedUpload.hook'
import { MdModeEditOutline } from 'react-icons/md'

const UpdateLessonSchema = yup.object({
  title: yup.string().required('Tiêu đề không được để trống').min(3, 'Tiêu đề phải có ít nhất 3 ký tự')
})

type UpdateLessonFormValues = yup.InferType<typeof UpdateLessonSchema>

const LessonForm = ({
  key,
  lesson,
  setChapters,
  chunkedUpload,
  fetchChapters
}: {
  key: number
  lesson: Lesson
  setChapters?: React.Dispatch<React.SetStateAction<Chapter[]>>
  chunkedUpload: ReturnType<typeof useChunkedUpload>
  fetchChapters: () => Promise<void>
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

  return (
    <>
      <div key={key} className='flex items-center space-x-4 p-4 rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-blue-100 group'>
        <GripVertical className='h-3.5 w-3.5 text-gray-300' />
        <span className='flex items-center justify-center w-8 h-8 rounded-xl bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all border border-gray-100/50 cursor-pointer shadow-sm group-hover:scale-105'>
          <MdModeEditOutline className='h-4 w-4' onClick={() => setPreview({ openPreview: true, lesson })} />
        </span>
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
            <div className='group flex items-center gap-3'>
              <span className='text-[13px] font-medium text-gray-700'>{lesson.title || 'Bài giảng chưa có tiêu đề'}</span>
              <CustomButton
                className='opacity-0 transition-all duration-300 group-hover:opacity-100 bg-gray-100 text-gray-500 p-1.5 rounded-lg shadow-sm hover:bg-white hover:text-blue-600 flex items-center justify-center'
                icon={<MdModeEditOutline className='w-3.5 h-3.5' />}
                onClick={() => {
                  setUpdateTitle(true)
                }}
              />
            </div>
          )}
        </div>
        <div className='flex items-center space-x-3'>
          <Badge
            variant='outline'
            className='capitalize flex items-center gap-2 border-gray-100 bg-gray-50/50 text-gray-500 text-[10px] font-bold px-3 py-1 rounded-xl shadow-none transition-all group-hover:bg-white group-hover:border-blue-100'
          >
            {lesson.type === 'video' ? (
              <Video className='w-3 h-3 text-blue-500' />
            ) : lesson.type === 'article' ? (
              <FileText className='w-3 h-3 text-blue-500' />
            ) : (
              <HelpCircle className='w-3 h-3 text-blue-500' />
            )}
            {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Bài viết' : 'Trắc nghiệm'}
          </Badge>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl p-0 flex items-center justify-center'
            onClick={() => handleDelLesson(lesson.id)}
          >
            <Trash2 className='h-3.5 w-3.5' />
          </Button>
        </div>
      </div>
      <CustomDialog
        open={preview.openPreview}
        setOpen={(v: boolean) => setPreview((prev) => ({ ...prev, openPreview: v }))}
        className='!max-w-[95vw] md:!max-w-5xl h-[90vh] overflow-hidden flex flex-col'
        contentClassName='flex-1 min-h-0'
        title={
          <>
            <BookOpen className='h-4 w-4 mr-2' />
            Chỉnh sửa bài giảng
          </>
        }
        description='Chỉnh sửa thông tin bài giảng'
      >
        <AddVideoForm
          lessonId={lesson.id as string}
          chapterId='' // Not needed for edit
          setOpen={(v) =>
            setPreview((prev) => ({ ...prev, openPreview: typeof v === 'function' ? v(prev.openPreview) : v }))
          }
          fetchChapters={fetchChapters}
          initialData={lesson}
          mode='edit'
          chunkedUpload={chunkedUpload}
          initialType={lesson.type === 'article' ? 'document' : 'video'}
          handleDelLesson={handleDelLesson}
        />
      </CustomDialog>
    </>
  )
}

export default LessonForm
