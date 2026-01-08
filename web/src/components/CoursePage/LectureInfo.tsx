import { Info } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Lesson } from '@/types/course-student'

export const LectureInfo = ({ lesson, thumbnailUri }: { lesson: Lesson; thumbnailUri: string }) => {
  return (
    <div className='space-y-3 min-h-[300px]'>
      <h2 className='text-xl flex items-center gap-2 font-semibold mb-2'>
        <Avatar>
          <AvatarImage src={thumbnailUri} />
          <AvatarFallback>{lesson?.title}</AvatarFallback>
        </Avatar>
        Bài học: {lesson?.title}
      </h2>

      {lesson?.content && (
        <div className='flex items-start text-muted-foreground text-sm mb-3'>
          <Info size={18} className='mt-1 mr-2' />
          <div dangerouslySetInnerHTML={{ __html: lesson.content }} />
        </div>
      )}
    </div>
  )
}
