import { ChevronDown } from 'lucide-react'
import { LectureItem } from './LectureItem'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

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

interface SectionListProps {
  sections: Section[]
  currentLectureId: number
  completedLectures: Set<number>
  onSelectLecture: (lecture: Lecture) => void
  onToggleComplete: (lectureId: number) => void
}

export const SectionList = ({
  sections,
  currentLectureId,
  completedLectures,
  onSelectLecture,
  onToggleComplete
}: SectionListProps) => {
  return (
    <div className='space-y-2'>
      {sections.map((section, index) => {
        const completedCount = section.lectures.filter((l) => completedLectures.has(l.id)).length
        const totalCount = section.lectures.length

        return (
          <Collapsible key={index} defaultOpen={index === 1}>
            <div className='border border-border rounded-lg overflow-hidden'>
              <CollapsibleTrigger className='w-full p-4 flex items-center justify-between hover:bg-sidebar-hover transition-colors group'>
                <div className='flex-1 text-left'>
                  <h3 className='font-semibold text-sm mb-1'>{section.title}</h3>
                  <p className='text-xs text-muted-foreground'>
                    {completedCount} / {totalCount} | {section.duration}
                  </p>
                </div>
                <ChevronDown className='w-5 h-5 text-muted-foreground transition-transform group-data-[state=open]:rotate-180' />
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className='p-2 space-y-1 bg-blue-50'>
                  {section.lectures.map((lecture) => (
                    <LectureItem
                      key={lecture.id}
                      lecture={lecture}
                      isActive={currentLectureId === lecture.id}
                      isCompleted={completedLectures.has(lecture.id)}
                      onSelect={() => onSelectLecture(lecture)}
                      onToggleComplete={() => onToggleComplete(lecture.id)}
                    />
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )
      })}
    </div>
  )
}
