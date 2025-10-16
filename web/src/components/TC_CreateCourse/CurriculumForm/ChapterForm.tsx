import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, ChevronDown, ChevronRight, GripVertical, Trash2, Send, X } from 'lucide-react'
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

const ChapterForm = ({
  chapter,
  updateSectionTitle,
  setChapters
}: {
  chapter: Chapter
  updateSectionTitle?: (sectionId: string, title: string) => void
  setChapters?: React.Dispatch<React.SetStateAction<Chapter[]>>
}) => {
  const [updateTitle, setUpdateTitle] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors }
  } = useForm<UpdateChapterFormValues>({
    resolver: yupResolver(UpdateChapterSchema) as any
  })

  const addLecture = (sectionId: string, type: 'video' | 'quiz' | 'article') => {
    // Logic to add a new lecture to the section
    console.log(`Add ${type} lecture to section ${sectionId}`)
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
        <CollapsibleTrigger className='w-full'>
          <div className='flex items-center justify-between p-4 hover:bg-blue-100/50 border-b border-blue-200 rounded-t-xl'>
            <div className='flex items-center space-x-3'>
              <GripVertical className='h-4 w-4 text-blue-400' />
              {chapter.isOpen ? (
                <ChevronDown className='h-4 w-4 text-blue-500' />
              ) : (
                <ChevronRight className='h-4 w-4 text-blue-500' />
              )}
              <div className='group relative flex space-x-2 px-2 py-1 rounded-md'>
                <span className='font-medium text-gray-800'>Phần {chapter.position + 1}:</span>

                {updateTitle ? (
                  <form className='space-y-2 w-full' onSubmit={handleSubmit((data) => console.log(data))}>
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
              <Button
                variant='ghost'
                size='icon'
                className='text-red-500 hover:bg-red-50'
                onClick={(e) => {
                  e.stopPropagation()
                }}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className='p-4 pb-4 space-y-2'>
            {chapter.lessons.map((lesson) => (
              <>
                <LessonForm key={lesson.id} lesson={lesson} />
              </>
            ))}

            <div className='flex space-x-2 mt-4'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => addLecture(chapter.id, 'video')}
                className='flex items-center space-x-1 border-blue-300 text-blue-600'
              >
                <Plus className='h-4 w-4' />
                <span>Bài giảng (Video)</span>
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => addLecture(chapter.id, 'quiz')}
                className='flex items-center space-x-1 border-blue-300 text-blue-600'
              >
                <Plus className='h-4 w-4' />
                <span>Quiz</span>
              </Button>

              <Button
                variant='outline'
                size='sm'
                onClick={() => addLecture(chapter.id, 'article')}
                className='flex items-center space-x-1 border-blue-300 text-blue-600'
              >
                <Plus className='h-4 w-4' />
                <span>Bài viết</span>
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  )
}

export default ChapterForm
