import { useMemo, useState, useEffect } from 'react'
import { Info, MessageCircleQuestionMark, NotebookPen, Brain, ClipboardList } from 'lucide-react'
import { QASection } from './QASection/QASection'
import { LectureInfo } from '@/components/CoursePage/LectureInfo'
import { Lesson } from '@/types/course-student'
import CustomButton from '@/components/common/Button'
import NoteSection from './NoteSection'
import lessonStudentService from '@/services/course/lesson-student.service'
import { AILessonInsights } from './AILessonInsights'
import { AnalysisResult } from '@/services/assistant/analysis.service'
import type { StudentLessonTestView } from '@/types/lesson-test-student.type'
import lessonTestStudentService from '@/services/assistant/lesson-test-student.service'
import { LessonTestStudentSection } from '@/components/CoursePage/LessonTestStudentSection'

/** True when GET …/lesson-test/student returns 200 and includes at least one quiz. */
function studentLessonTestHasQuestions(result: StudentLessonTestView | undefined): boolean {
  if (!result?.chunkGroups?.length) return false
  return result.chunkGroups.some((g) => (g.quizzes?.length ?? 0) > 0)
}

export const TabNavigation = ({
  currentLecture,
  thumbnailUri,
  currentLectureId,
  instructorId,
  analysisData,
  onSeek,
  activeTab: externalActiveTab,
  onTabChange,
  selectedChunkId,
  watchedPercent
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
  watchedPercent: number
}) => {
  const activeTab = externalActiveTab
  const setActiveTab = onTabChange
  const [noteContent, setNoteContent] = useState('')
  const [lessonTestTabVisible, setLessonTestTabVisible] = useState(false)
  /** Cached GET student lesson-test (same payload as tab probe — avoids a second fetch when opening the tab). */
  const [lessonTestPrefetch, setLessonTestPrefetch] = useState<StudentLessonTestView | null>(null)

  const tabs: { label: string; icon: React.ReactNode; onClick?: () => void }[] = useMemo(
    () => {
      const baseTabs = [
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
        },
        ...(lessonTestTabVisible && (watchedPercent >= 70 || currentLecture.completionStatus === 'COMPLETED')
          ? [
            {
              label: 'Bài kiểm tra',
              icon: <ClipboardList className='w-3.5 h-3.5' />
            }
          ]
          : [])
      ]

      if (!analysisData) {
        return baseTabs.filter((t) => t.label !== 'AI Phân tích')
      }
      return baseTabs
    },
    [analysisData, lessonTestTabVisible]
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

  useEffect(() => {
    let cancelled = false
    const lessonId = currentLecture.id

    if (!lessonId || lessonId === 'introduction') {
      setLessonTestTabVisible(false)
      return
    }

    const probe = async () => {
      setLessonTestTabVisible(false)
      setLessonTestPrefetch(null)
      try {
        const res = await lessonTestStudentService.getStudentLessonTest(lessonId)
        if (cancelled) return
        const visible =
          res.code === 200 && res.result != null && studentLessonTestHasQuestions(res.result)
        setLessonTestTabVisible(visible)
        setLessonTestPrefetch(visible && res.result ? res.result : null)
      } catch {
        if (!cancelled) {
          setLessonTestTabVisible(false)
          setLessonTestPrefetch(null)
        }
      }
    }

    void probe()

    return () => {
      cancelled = true
    }
  }, [currentLecture.id])

  useEffect(() => {
    const isAnalysisUnavailable = !analysisData || analysisData.status?.toLowerCase() === 'failed'
    if (isAnalysisUnavailable && activeTab === 'AI Phân tích') {
      setActiveTab('Tổng quan')
    }
  }, [analysisData, activeTab, setActiveTab])

  useEffect(() => {
    const isQuizUnlocked = watchedPercent >= 70 || currentLecture.completionStatus === 'COMPLETED'
    if ((!lessonTestTabVisible || !isQuizUnlocked) && activeTab === 'Bài kiểm tra') {
      setActiveTab('Tổng quan')
    }
  }, [lessonTestTabVisible, activeTab, setActiveTab, watchedPercent, currentLecture.completionStatus])

  return (
    <div className='border-b border-border'>
      <div className='flex items-center overflow-x-auto'>
        {tabs.map((tab) => (
          <CustomButton
            key={tab.label}
            onClick={() => (tab.onClick ? tab.onClick() : setActiveTab(tab.label))}
            className={`py-3 md:py-4 px-3 md:px-5 text-[11px] font-bold tracking-[0.1em] bg-white transition-all relative whitespace-nowrap flex-shrink-0 ${activeTab === tab.label ? 'text-blue-600' : 'text-muted-foreground hover:text-foreground'
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

      <div className='px-0 min-h-[600px] overflow-visible'>
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
        {activeTab === 'Bài kiểm tra' && lessonTestTabVisible && (
          <div className='mt-2 mx-auto w-full'>
            <LessonTestStudentSection
              key={currentLecture.id}
              lessonId={currentLecture.id}
              initialView={lessonTestPrefetch}
              onPrefetchRefresh={setLessonTestPrefetch}
              onSeek={onSeek}
              chunks={analysisData?.chunks ?? []}
            />
          </div>
        )}
      </div>
    </div>
  )
}
