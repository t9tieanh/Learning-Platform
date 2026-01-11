import { useMemo, useState, useEffect } from 'react'
import { Search, Info, MessageCircleQuestionMark, NotebookPen } from 'lucide-react'
import { QASection } from './QASection/QASection'
import { LectureInfo } from '@/components/CoursePage/LectureInfo'
import { Lesson } from '@/types/course-student'
import CustomButton from '@/components/common/Button'
import NoteSection from './NoteSection'
import lessonStudentService from '@/services/course/lesson-student.service'

export const TabNavigation = ({
  currentLecture,
  thumbnailUri,
  currentLectureId,
  instructorId
}: {
  currentLecture: Lesson
  thumbnailUri: string
  currentLectureId: string
  instructorId: string
}) => {
  const [activeTab, setActiveTab] = useState('Tổng quan')
  const [open, setOpen] = useState(false)
  const [noteContent, setNoteContent] = useState('')
  const tabs = useMemo(
    () => [
      {
        label: 'Tổng quan',
        icon: <Info className='w-5 h-5' />
      },
      {
        label: 'Hỏi đáp',
        icon: <MessageCircleQuestionMark className='w-5 h-5' />
      },
      {
        label: 'Ghi chú',
        icon: <NotebookPen className='w-5 h-5' />,
        onClick: () => {
          setOpen(true)
        }
      }
    ],
    []
  )

  useEffect(() => {
    const fetchNoteContent = async () => {
      try {
        const response = await lessonStudentService.getLessonInfo(currentLectureId)
        if (response && response.code === 200 && response.result) {
          setNoteContent(response.result.note)
        }
      } catch (error) {
        console.error('Failed to fetch note content', error)
      }
    }

    fetchNoteContent()
  }, [currentLectureId])

  return (
    <div className='border-b border-border'>
      <div className='flex items-center gap-1 overflow-x-auto'>
        <button className='p-3 md:p-4 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0'>
          <Search className='w-4 md:w-5 h-4 md:h-5' />
        </button>
        {tabs.map((tab) => (
          <CustomButton
            key={tab.label}
            onClick={() => (tab.onClick ? tab.onClick() : setActiveTab(tab.label))}
            className={`py-3 md:py-4 px-2 md:px-4 text-xs md:text-sm font-medium bg-white transition-colors relative whitespace-nowrap flex-shrink-0 ${
              activeTab === tab.label ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
            label={
              <>
                {tab.label}
                {activeTab === tab.label && <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-primary' />}
                {tab.label === 'Notes' && noteContent && noteContent?.trim() !== '' && (
                  <span className='ml-1 inline-block w-2 h-2 bg-red-500 rounded-full'></span>
                )}
              </>
            }
            icon={tab.icon}
          />
        ))}
      </div>

      <div className='px-3 md:px-6'>
        {activeTab === 'Hỏi đáp' && <QASection lessonId={String(currentLectureId)} instructorId={instructorId} />}
        {activeTab === 'Tổng quan' && (
          <div className='mt-6 mx-auto w-full'>
            <LectureInfo lesson={currentLecture} thumbnailUri={thumbnailUri} />
          </div>
        )}
      </div>
      <NoteSection
        lessonId={currentLecture.id}
        open={open}
        setOpen={setOpen}
        note={noteContent}
        setNote={setNoteContent}
      />
    </div>
  )
}
