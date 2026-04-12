/* eslint-disable react/no-children-prop */
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ChevronDown, GripVertical, Trash2, Send, X, BookOpen, PlusCircle } from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
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
import AddVideoForm from './AddVideoUpdated'
import { toast } from 'sonner'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import { useChunkedUpload } from '@/hooks/useChunkedUpload.hook'

const ChapterForm = ({
  chapter,
  setChapters,
  chunkedUpload,
  fetchChapters
}: {
  chapter: Chapter
  setChapters?: React.Dispatch<React.SetStateAction<Chapter[]>>
  chunkedUpload: ReturnType<typeof useChunkedUpload>
  fetchChapters: () => Promise<void>
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

  const handleUpdateChapter = async (data: UpdateChapterFormValues) => {
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
    <div key={chapter.id} className='border border-gray-200 shadow-md bg-white rounded-[32px] overflow-hidden mb-8 transition-all hover:border-blue-200'>
      <Collapsible open={chapter.isOpen} onOpenChange={() => toggleSection(chapter.id)}>
        <CollapsibleTrigger className='w-full outline-none' asChild>
          <div className='flex items-center justify-between p-5 hover:bg-gray-50/50 border-b border-gray-50 transition-colors cursor-pointer group'>
            <div className='flex items-center space-x-4'>
              <div className='p-2 bg-gray-50 rounded-xl group-hover:bg-blue-50 transition-colors'>
                <GripVertical className='h-3.5 w-3.5 text-gray-400 group-hover:text-blue-400' />
              </div>
              <ChevronDown
                className={cn(
                  'h-4 w-4 text-gray-400 transition-transform duration-500 ease-in-out',
                  chapter.isOpen ? 'rotate-0' : '-rotate-90'
                )}
              />
              <div className='group/title relative flex items-center space-x-2'>
                <span className='text-[13px] font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap'>Phần {chapter.position}:</span>

                {updateTitle ? (
                  <form
                    className='space-y-2 w-full'
                    onSubmit={handleSubmit(handleUpdateChapter)}
                    onClick={(e) => e.stopPropagation()}
                  >
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
                  <span className='text-[13px] font-black text-gray-900 line-clamp-1'>{chapter.title}</span>
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
            <div className='flex items-center space-x-3'>
              <Badge variant='outline' className='border-blue-100 text-blue-600 bg-blue-50/50 text-[10px] font-bold px-3 py-1 rounded-xl shadow-none'>
                {chapter.lessons.length} bài học
              </Badge>
              <CustomButton
                icon={<Trash2 className='h-3.5 w-3.5' />}
                className='text-gray-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl h-8 w-8 p-0 flex items-center justify-center'
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
                <LessonForm
                  key={index}
                  lesson={lesson}
                  setChapters={setChapters}
                  chunkedUpload={chunkedUpload}
                  fetchChapters={fetchChapters}
                />
              ))}
            </div>

            <div className='flex items-center space-x-2 mt-6'>
              <Button
                variant='default'
                size='sm'
                onClick={() => setOpen(true)}
                className='flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-100 transition-all active:scale-95 px-6 rounded-2xl'
              >
                <PlusCircle className='h-4 w-4' />
                <span className='text-[11px] font-bold uppercase tracking-wider'>Thêm bài giảng mới</span>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
      <CustomDialog
        open={open}
        setOpen={setOpen}
        className='!max-w-[95vw] md:!max-w-5xl h-[90vh] overflow-hidden flex flex-col'
        contentClassName='flex-1 min-h-0'
        title={
          <>
            <BookOpen className='h-4 w-4 mr-2' />
            Thêm bài giảng mới
          </>
        }
        description='Hãy thêm Thêm bài giảng cho khóa học của bạn !'
        children={
          <>
            <AddVideoForm
              setOpen={setOpen}
              chapterId={chapter.id}
              chunkedUpload={chunkedUpload}
              fetchChapters={fetchChapters}
            />
          </>
        }
      />
    </div>
  )
}

export default ChapterForm
