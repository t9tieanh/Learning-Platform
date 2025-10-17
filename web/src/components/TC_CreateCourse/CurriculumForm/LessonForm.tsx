import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, GripVertical, HelpCircle, Play, Trash2 } from 'lucide-react'
import { Lesson } from '@/utils/create-course/curriculum'
import { useCallback } from 'react'

const LessonForm = ({ lesson }: { lesson: Lesson }) => {
  const getLectureIcon = useCallback((type: string) => {
    switch (type) {
      case 'video':
        return <Play className='h-4 w-4' />
      case 'article':
        return <FileText className='h-4 w-4' />
      case 'quiz':
        return <HelpCircle className='h-4 w-4' />
      default:
        return <Play className='h-4 w-4' />
    }
  }, [])

  return (
    <>
      <div key={lesson.id} className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200'>
        <GripVertical className='h-4 w-4 text-blue-400' />
        {getLectureIcon(lesson.type)}
        <div className='flex-1'>
          {lesson.type === 'video' && lesson.title && (
            <span className='text-xs text-gray-500'>Đã chọn: {lesson.title}</span>
          )}
        </div>
        <div className='flex items-center space-x-2'>
          <Badge variant='secondary' className='capitalize bg-blue-100 text-blue-700'>
            {lesson.type === 'video' ? 'Video' : lesson.type === 'article' ? 'Bài viết' : 'Quiz'}
          </Badge>
          {lesson.type === 'video' && (
            <>
              <input type='file' accept='video/*' id={`upload-${lesson.id}`} className='hidden' />
              <Button asChild variant='outline' size='sm' className='border-blue-300 text-blue-600'>
                <label htmlFor={`upload-${lesson.id}`} className='cursor-pointer'>
                  Thêm video
                </label>
              </Button>
            </>
          )}
          <Button variant='ghost' size='icon' className='text-red-500 hover:bg-red-50'>
            <Trash2 className='h-4 w-4' />
          </Button>
        </div>
      </div>
    </>
  )
}

export default LessonForm
