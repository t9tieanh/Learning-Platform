import { useMemo, useState } from 'react'
import { Search, Info, MessageCircleQuestionMark, NotebookPen } from 'lucide-react'
import { QASection } from './QASection'
import { LectureInfo } from '@/components/CoursePage/LectureInfo'
import { Lesson } from '@/types/course-student'
import CustomButton from '@/components/common/Button'
import NoteSection from './NoteSection'

export const TabNavigation = ({ currentLecture, thumbnailUri }: { currentLecture: Lesson; thumbnailUri: string }) => {
  const [activeTab, setActiveTab] = useState('Overview')
  const [open, setOpen] = useState(false)
  const tabs = useMemo(
    () => [
      {
        label: 'Overview',
        icon: <Info className='w-5 h-5' />
      },
      {
        label: 'Q&A',
        icon: <MessageCircleQuestionMark className='w-5 h-5' />
      },
      {
        label: 'Notes',
        icon: <NotebookPen className='w-5 h-5' />,
        onClick: () => {
          setOpen(true)
        }
      }
    ],
    []
  )

  return (
    <div className='border-b border-border'>
      <div className='flex items-center gap-1'>
        <button className='p-4 text-muted-foreground hover:text-foreground transition-colors'>
          <Search className='w-5 h-5' />
        </button>
        {tabs.map((tab) => (
          <CustomButton
            key={tab.label}
            onClick={() => (tab.onClick ? tab.onClick() : setActiveTab(tab.label))}
            className={`py-4 text-sm font-medium bg-white transition-colors relative ${
              activeTab === tab.label ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            label={
              <>
                {tab.label}
                {activeTab === tab.label && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />}
              </>
            }
            icon={tab.icon}
          />
        ))}
      </div>

      <div>
        {activeTab === 'Q&A' && <QASection />}
        {activeTab === 'Overview' && (
          <div className='mt-6 px-6 mx-auto w-full'>
            <LectureInfo lesson={currentLecture} thumbnailUri={thumbnailUri} />
          </div>
        )}
      </div>
      <NoteSection lessonId={currentLecture.id} open={open} setOpen={setOpen} />
    </div>
  )
}
