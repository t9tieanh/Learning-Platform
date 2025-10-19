/* eslint-disable react/no-children-prop */
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronDown, ChevronRight, GripVertical, Trash2, Send, X, BookOpen } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Chapter, UpdateChapterSchema, UpdateChapterFormValues } from '@/utils/create-course/curriculum'
import LessonForm from './LessonForm'
import CustomInput from '@/components/common/Input'
import CustomButton from '@/components/common/Button'
import { MdEdit } from 'react-icons/md'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import CustomTextarea from '@/components/common/Textarea'
import chapterService from '@/services/course/chapter.service'
import CustomDialog from '@/components/common/Dialog'
import AddVideoForm from './addVideo/AddVideoForm'
import { toast } from 'sonner'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import { HandleAddLesson } from '@/components/TC_CreateCourse/CurriculumForm/index'
import AddDocumentForm from './addVideo/AddDocumentForm'

const ChapterForm = ({
  chapter,
  setChapters,
  handleAddLesson
}: {
  chapter: Chapter
  setChapters?: React.Dispatch<React.SetStateAction<Chapter[]>>
  handleAddLesson: HandleAddLesson
}) => {
  const [updateTitle, setUpdateTitle] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UpdateChapterFormValues>({
    resolver: yupResolver(UpdateChapterSchema) as any
  })

  // for dialog add video, lecture
  const [open, setOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'video' | 'document'>('video')

  const updateChapter = async (data: UpdateChapterFormValues) => {
    const result = await chapterService.updateChapter({
      id: chapter.id,
      title: data.title,
      position: chapter.position,
      description: data.description
    })

    if (result && result.code === 200 && result.result) {
      if (setChapters) {
        setChapters((prevChapters) =>
          prevChapters.map((ch) =>
            ch.id === chapter.id ? { ...ch, title: data.title, description: data.description } : ch
          )
        )
      }
      setUpdateTitle(false)
    }
  }

  const addLecture = (type: 'video' | 'quiz' | 'article') => {
    setDialogType(type === 'video' ? 'video' : 'document')
    setOpen(true)
  }

  // Handle delete chapter
  const handleDeleteChapter = async (e: React.MouseEvent) => {
    e.stopPropagation()
    const confirmed = await showConfirmToast({
      title: 'Xóa chương',
      description: 'Bạn có chắc muốn xóa chương này? Hành động không thể hoàn tác.',
      confirmLabel: 'Có, xóa',
      cancelLabel: 'Hủy'
    })

    if (!confirmed) return

    const result = await chapterService.deleteChapter(chapter.id)
    if (result && result.code === 200 && result.message) {
      toast.success(result.message || 'Xóa chương thành công')
      if (setChapters) {
        setChapters((prevChapters) => prevChapters.filter((ch) => ch.id !== chapter.id))
      }
    } else {
      toast.error(result.message || 'Xóa chương thất bại. Vui lòng thử lại.')
    }
  }

  // Toggle section open/close
  const toggleSection = (sectionId: string) => {
    if (!setChapters) return
    setChapters((prevChapters) =>
      prevChapters.map((chapter) => (chapter.id === sectionId ? { ...chapter, isOpen: !chapter.isOpen } : chapter))
    )
  }

  return (
    <div key={chapter.id} className='border border-blue-200 rounded-xl shadow-sm'>
      <Collapsible open={chapter.isOpen} onOpenChange={() => toggleSection(chapter.id)}>
        <CollapsibleTrigger className='w-full' asChild>
          <div className='flex items-center justify-between p-4 hover:bg-blue-100/50 border-b border-blue-200 rounded-t-xl'>
            <div className='flex items-center space-x-3'>
              <GripVertical className='h-4 w-4 text-blue-400' />
              {chapter.isOpen ? (
                <ChevronDown className='h-4 w-4 text-blue-500' />
              ) : (
                <ChevronRight className='h-4 w-4 text-blue-500' />
              )}
              <div className='group relative flex space-x-2 px-2 py-1 rounded-md'>
                <span className='font-medium text-gray-800'>Phần {chapter.position}:</span>

                {updateTitle ? (
                  <form className='space-y-2 w-full' onSubmit={handleSubmit(updateChapter)}>
                    <CustomInput placeholder='Nhập tiêu đề mới' type='text' {...register('title')} />
                    {errors.title && <span className='text-red-500 text-xs'>{errors.title.message}</span>}

                    <CustomTextarea placeholder='Nhập mô tả ngắn cho section này' {...register('description')} />
                    {errors.description && <span className='text-red-500 text-xs'>{errors.description.message}</span>}

                    <div className='flex'>
                      <CustomButton
                        className='bg-blue-500 text-white hover:bg-blue-600 mt-2'
                        label='Lưu'
                        type='submit'
                        icon={<Send className='h-4 w-4 ml-1' />}
                      />
                      <CustomButton
                        className='bg-gray-200 text-dark hover:bg-gray-300 mt-2 ml-2'
                        label='Hủy'
                        onClick={(e) => {
                          e.preventDefault()
                          setUpdateTitle(false)
                        }}
                        icon={<X className='h-4 w-4 ml-1' />}
                      />
                    </div>
                  </form>
                ) : (
                  <>
                    <span className='font-medium text-gray-800'>{chapter.title}</span>
                  </>
                )}

                {!updateTitle && (
                  <CustomButton
                    className='opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gray-200 text-dark p-1.5 rounded-md shadow hover:bg-gray-100 flex items-center justify-center'
                    icon={<MdEdit />}
                    onClick={() => {
                      setUpdateTitle(true)
                    }}
                  />
                )}
              </div>
            </div>
            <div className='flex items-center space-x-2'>
              <Badge variant='outline' className='border-blue-300 text-blue-600 bg-blue-50'>
                {chapter.lessons.length} bài
              </Badge>
              <CustomButton
                icon={<Trash2 className='h-4 w-4' />}
                className='text-red-500 hover:bg-gray-60 bg-white'
                onClick={(e) => {
                  handleDeleteChapter(e)
                }}
              />
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className='p-4 pb-4'>
            <div className='lessons space-y-2'>
              {chapter.lessons.length === 0 && (
                <p className='text-gray-500 text-sm px-4'>Chưa có bài giảng nào trong phần này.</p>
              )}
              {chapter.lessons.map((lesson, index) => (
                <LessonForm key={index} lesson={lesson} setChapters={setChapters} />
              ))}
            </div>

            <div className='flex space-x-2 mt-6'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => addLecture('video')}
                className='flex items-center space-x-1 border-blue-300 text-blue-600'
              >
                <Plus className='h-4 w-4' />
                <span>Bài giảng (Video)</span>
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => addLecture('quiz')}
                className='flex items-center space-x-1 border-blue-300 text-blue-600'
              >
                <Plus className='h-4 w-4' />
                <span>Quiz</span>
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => addLecture('article')}
                className='flex items-center space-x-1 border-blue-300 text-blue-600'
              >
                <Plus className='h-4 w-4' />
                <span>Bài viết</span>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <CustomDialog
        open={open}
        setOpen={setOpen}
        title={
          <>
            <BookOpen className='h-4 w-4 mr-2' />
            Thêm bài giảng mới
          </>
        }
        description='Hãy thêm Thêm bài giảng cho khóa học của bạn !'
        children={
          dialogType === 'video' ? (
            <AddVideoForm setOpen={setOpen} chapterId={chapter.id} handleAddLesson={handleAddLesson} />
          ) : (
            <AddDocumentForm setOpen={setOpen} chapterId={chapter.id} handleAddLesson={handleAddLesson} />
          )
        }
        size='xl'
      />
    </div>
  )
}

export default ChapterForm
