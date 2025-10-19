import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, GripVertical, HelpCircle, Play, Trash2 } from 'lucide-react'
import { Lesson } from '@/utils/create-course/curriculum'
import { useCallback } from 'react'

const LessonForm = ({ key, lesson }: { key: number; lesson: Lesson }) => {
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
      <div key={key} className='flex items-center space-x-3 p-2 bg-blue-50 rounded-lg border border-blue-200'>
        <GripVertical className='h-4 w-4 text-blue-400' />
        {getLectureIcon(lesson.type)}
        <div className='flex-1'>
          <span className='font-medium text-sm'>{lesson.title || 'Bài giảng chưa có tiêu đề'}</span>
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='secondary' className='capitalize bg-blue-100 text-blue-700'>
            {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Bài viết' : 'Quiz'}
          </Badge>
          <Button variant='ghost' size='icon' className='text-red-500 hover:bg-red-50'>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </>
  )
}

export default LessonForm
