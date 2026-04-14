import { useMemo, useState, useEffect } from 'react'
import { Search, Info, MessageCircleQuestionMark, NotebookPen, Brain } from 'lucide-react'
import { QASection } from './QASection/QASection'
import { LectureInfo } from '@/components/CoursePage/LectureInfo'
import { Lesson } from '@/types/course-student'
import CustomButton from '@/components/common/Button'
import NoteSection from './NoteSection'
import lessonStudentService from '@/services/course/lesson-student.service'
import { AILessonInsights } from './AILessonInsights'
import { AnalysisResult } from '@/services/assistant/analysis.service'

export const TabNavigation = ({
  currentLecture,
  thumbnailUri,
  currentLectureId,
  instructorId,
  analysisData,
  onSeek,
  activeTab: externalActiveTab,
  onTabChange,
  selectedChunkId
}: {
  currentLecture: Lesson
  thumbnailUri: string
  currentLectureId: string
  instructorId: string
  analysisData?: AnalysisResult | null
  onSeek?: (timestamp: string) => void
  activeTab: string
  onTabChange: (tab: string) => void
  selectedChunkId?: string | null
}) => {
  const activeTab = externalActiveTab
  const setActiveTab = onTabChange
  const [noteContent, setNoteContent] = useState('')
  const tabs: { label: string; icon: React.ReactNode; onClick?: () => void }[] = useMemo(
    () => [
      {
        label: 'Tổng quan',
        icon: <Info className='w-3.5 h-3.5' />
      },
      {
        label: 'AI Phân tích',
        icon: <Brain className='w-3.5 h-3.5 text-blue-500' />
      },
      {
        label: 'Hỏi đáp',
        icon: <MessageCircleQuestionMark className='w-3.5 h-3.5' />
      },
      {
        label: 'Ghi chú',
        icon: <NotebookPen className='w-3.5 h-3.5' />
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
      <div className='flex items-center overflow-x-auto'>
        {tabs.map((tab) => (
          <CustomButton
            key={tab.label}
            onClick={() => (tab.onClick ? tab.onClick() : setActiveTab(tab.label))}
            className={`py-3 md:py-4 px-3 md:px-5 text-[10px] font-black uppercase tracking-widest bg-white transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === tab.label ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'
              }`}
            label={
              <div className='flex items-center'>
                {tab.label}
                {activeTab === tab.label && <div className='absolute bottom-0 left-0 right-0 h-[3px] bg-blue-600 rounded-full mx-2' />}
                {tab.label === 'Notes' && noteContent && noteContent?.trim() !== '' && (
                  <span className='ml-1 inline-block w-1.5 h-1.5 bg-red-500 rounded-full'></span>
                )}
              </div>
            }
            icon={tab.icon}
          />
        ))}
      </div>

      <div className='px-0 md:px-6 min-h-[600px]'>
        {activeTab === 'Hỏi đáp' && <QASection lessonId={String(currentLectureId)} instructorId={instructorId} />}
        {activeTab === 'Tổng quan' && (
          <div className='mt-6 mx-auto w-full space-y-8'>
            <LectureInfo lesson={currentLecture} thumbnailUri={thumbnailUri} />
          </div>
        )}
        {activeTab === 'AI Phân tích' && (
          <div className='mt-2 mx-auto w-full'>
            <AILessonInsights
              lessonId={currentLecture.id}
              summary={analysisData?.summary || null}
              chunks={analysisData?.chunks || []}
              subtitles={analysisData?.subtitles || null}
              onSeek={onSeek}
              defaultOpenChunkId={selectedChunkId}
            />
          </div>
        )}
        {activeTab === 'Ghi chú' && (
          <div className='mt-2 mx-auto w-full'>
            <NoteSection
              lessonId={currentLecture.id}
              note={noteContent}
              setNote={setNoteContent}
            />
          </div>
        )}
      </div>
    </div>
  )
}
