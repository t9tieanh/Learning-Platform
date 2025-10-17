import { X } from 'lucide-react'
import { SectionList } from './SectionList'

interface Lecture {
  id: number
  title: string
  duration: string
  type: 'video' | 'pdf'
  url: string
}

interface Section {
  title: string
  duration: string
  lectures: Lecture[]
}

interface CourseSidebarProps {
  sections: Section[]
  currentLectureId: number
  completedLectures: Set<number>
  onSelectLecture: (lecture: Lecture) => void
  onToggleComplete: (lectureId: number) => void
  onClose?: () => void
}

export const CourseSidebar = ({
  sections,
  currentLectureId,
  completedLectures,
  onSelectLecture,
  onToggleComplete,
  onClose
}: CourseSidebarProps) => {
  return (
    <aside className='w-full lg:w-[400px] h-full bg-sidebar-background border-l border-sidebar-border flex flex-col'>
      <div className='flex items-center justify-between p-4 border-b border-sidebar-border'>
        <h2 className='text-lg font-semibold'>Course content</h2>
        {onClose && (
          <button onClick={onClose} className='lg:hidden p-1 hover:bg-sidebar-hover rounded transition-colors'>
            <X className='w-5 h-5' />
          </button>
        )}
      </div>
      <div className='flex-1 overflow-y-auto p-4'>
        <SectionList
          sections={sections}
          currentLectureId={currentLectureId}
          completedLectures={completedLectures}
          onSelectLecture={onSelectLecture}
          onToggleComplete={onToggleComplete}
        />
      </div>
    </aside>
  )
}
