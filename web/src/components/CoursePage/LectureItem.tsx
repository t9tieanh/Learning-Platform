import { TvMinimalPlay, File } from 'lucide-react'
import { IoCheckmarkDoneCircle } from 'react-icons/io5'

interface LectureItemProps {
  lecture: {
    id: number
    title: string
    duration: string
    videoUrl?: string
    type: 'video' | 'article'
    content: string
    completionStatus?: 'NOT_STARTED' | 'COMPLETED'
  }
  isActive: boolean
  onSelect: () => void
}

export const LectureItem = ({ lecture, isActive, onSelect }: LectureItemProps) => {
  return (
    <div
      role='button'
      tabIndex={0}
      aria-pressed={isActive}
      className={`group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all ${
        isActive ? 'bg-primary/10 border border-primary/30' : 'hover:bg-sidebar-hover'
      }`}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onSelect?.()
        }
      }}
    >
      <div className='flex-1 min-w-0'>
        <div className='flex items-start gap-2 mb-1'>
          {lecture?.type === 'video' ? (
            <TvMinimalPlay
              className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 ${
                isActive ? 'text-primary font-medium' : 'text-foreground'
              }}`}
            />
          ) : (
            <File
              className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 ${
                isActive ? 'text-primary font-medium' : 'text-foreground'
              }}`}
            />
          )}
          <p className={`text-sm leading-snug ${isActive ? 'text-primary font-medium' : 'text-foreground'}`}>
            {lecture.title}{' '}
            {lecture.completionStatus === 'COMPLETED' ? (
              <IoCheckmarkDoneCircle className='inline-block w-4 h-4 text-primary' />
            ) : (
              ''
            )}
          </p>
        </div>
        <p className='text-xs text-muted-foreground ml-6'>
          {lecture.type === 'video' ? lecture.duration : lecture?.content?.slice(0, 10)}
        </p>
      </div>
    </div>
  )
}
