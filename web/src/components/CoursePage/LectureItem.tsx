import { Checkbox } from '@/components/ui/checkbox'
import { Play } from 'lucide-react'

interface LectureItemProps {
  lecture: {
    id: number
    title: string
    duration: string
    videoUrl?: string
  }
  isActive: boolean
  isCompleted: boolean
  onSelect: () => void
  onToggleComplete: () => void
}

export const LectureItem = ({ lecture, isActive, isCompleted, onSelect, onToggleComplete }: LectureItemProps) => {
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
          <Play
            className={`w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5 ${
              isActive ? 'text-primary font-medium' : 'text-foreground'
            }}`}
          />
          <p className={`text-sm leading-snug ${isActive ? 'text-primary font-medium' : 'text-foreground'}`}>
            {lecture.title}
          </p>
        </div>
        <p className='text-xs text-muted-foreground ml-6'>{lecture.duration}</p>
      </div>
    </div>
  )
}
