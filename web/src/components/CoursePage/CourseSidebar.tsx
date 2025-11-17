import { X, TableOfContents } from 'lucide-react'
import { SectionList } from './SectionList'

interface Lecture {
  id: number
  title: string
  duration: string
  type: 'video' | 'article'
  url: string
  content: string
  completionStatus?: 'NOT_STARTED' | 'COMPLETED'
}

interface Section {
  title: string
  duration: string
  lectures: Lecture[]
}

interface CourseSidebarProps {
  sections: Section[]
  currentLectureId: number
  onSelectLecture: (lecture: Lecture) => void
  onClose?: () => void
}

export const CourseSidebar = ({ sections, currentLectureId, onSelectLecture, onClose }: CourseSidebarProps) => {
  return (
    <aside className='w-full lg:w-[400px] h-full bg-sidebar-background border-l border-sidebar-border flex flex-col'>
      <div className='flex items-center justify-between p-4 border-b border-sidebar-border'>
        <h2 className='flex items-center gap-2 text-lg font-semibold'>
          <TableOfContents className='w-5 h-5 mr-2' /> Nội dung khóa học
        </h2>
        {onClose && (
          <button onClick={onClose} className='lg:hidden p-1 hover:bg-sidebar-hover rounded transition-colors'>
            <X className='w-5 h-5' />
          </button>
        )}
      </div>
      <div className='flex-1 overflow-y-auto p-4'>
        <SectionList sections={sections} currentLectureId={currentLectureId} onSelectLecture={onSelectLecture} />
      </div>
    </aside>
  )
}
