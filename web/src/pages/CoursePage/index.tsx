import { useMemo, useState, useEffect, useRef } from 'react'
import { ChevronLeft } from 'lucide-react'
import { LessonViewer } from '@/components/CoursePage/LessonViewer'
import { TabNavigation } from '@/components/CoursePage/TabNavigation'
import { CourseSidebar } from '@/components/CoursePage/CourseSidebar'
import { CourseDetail, Lesson } from '@/types/course-student'
import courseService from '@/services/course/course-student.service'
import { useParams, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Button from '@/components/common/Button'
import { CourseSkeleton } from '@/components/CoursePage/CourseSkeleton'
import { TabNavigationSkeleton } from '@/components/CoursePage/TabNavigationSkeleton'
import { CourseSidebarSkeleton } from '@/components/CoursePage/CourseSidebarSkeleton'
import { AnalysisResult } from '@/services/assistant/analysis.service'
import assistantAnalysisService from '@/services/assistant/analysis.service'
import HighGlossBackground from '@/components/common/HighGlossBackground'

const CoursePage = () => {
  type UILecture = {
    id: string
    title: string
    duration: string
    type: 'video' | 'article'
    content: string
    url: string
    completionStatus?: 'NOT_STARTED' | 'COMPLETED'
  }
  const { courseId } = useParams<{ courseId: string }>()
  const [courseData, setCourseData] = useState<CourseDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [currentLecture, setCurrentLecture] = useState<Lesson>()
  const [activeTab, setActiveTab] = useState('Tổng quan')
  const [selectedChunkId, setSelectedChunkId] = useState<string | null>(null)
  const navigate = useNavigate()
  const viewerRef = useRef<import('@/components/CoursePage/VideoPlayer').VideoPlayerRef>(null)

  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false)

  const handleSeek = (timestamp: string) => {
    if (!viewerRef.current) return

    // Convert "00:01:23,456" or "01:23" to seconds
    const parts = timestamp.split(/[: ,]/).map(parseFloat)
    let seconds = 0
    if (parts.length >= 3) {
      // hh:mm:ss
      seconds = parts[0] * 3600 + parts[1] * 60 + parts[2]
      if (parts[3] && timestamp.includes(',')) seconds += parts[3] / 1000
    } else if (parts.length === 2) {
      // mm:ss
      seconds = parts[0] * 60 + parts[1]
    }

    viewerRef.current.seekTo(seconds)
  }

  const handleShowChunkDetails = (chunkId: string) => {
    setSelectedChunkId(chunkId)
    setActiveTab('AI Phân tích')
  }

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseId) return
      setIsLoading(true)
      try {
        const response = await courseService.getCourseDetails(courseId)
        if (response && response.code === 200 && response.result) {
          setCourseData(response.result)

          // select lecture introduction
          setCurrentLecture({
            id: 'introduction',
            title: 'Giới thiệu khóa học',
            content: response.result.longDescription || '',
            duration: null,
            introductionVideo: response.result.introductoryVideo as string,
            position: null,
            type: 'video',
            completionStatus: 'COMPLETED',
            thumbnailUrl: response.result.thumbnailUrl as string
          })
        }
      } catch (error) {
        console.error('Failed to fetch course details', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseInfo()
  }, [courseId])

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!currentLecture?.id || currentLecture.id === 'introduction') {
        setAnalysisData(null)
        return
      }

      setIsLoadingAnalysis(true)
      try {
        const response = await assistantAnalysisService.getAnalysisDetail(currentLecture.id)
        if (response && response.code === 200 && response.result) {
          setAnalysisData(response.result)
        } else {
          setAnalysisData(null)
        }
      } catch (error) {
        setAnalysisData(null)
      } finally {
        setIsLoadingAnalysis(false)
      }
    }

    fetchAnalysis()
  }, [currentLecture?.id])

  // Map CourseDetail.chapters -> UI sections expected by CourseSidebar
  type UISection = { title: string; duration: string; lectures: UILecture[] }
  const uiSections = useMemo<UISection[]>(() => {
    const fmt = (sec?: number | null) => (sec ? `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}` : '—')
    const chapters = courseData?.chapters ?? []
    return chapters.map((ch) => ({
      title: ch.title,
      // simple total duration: sum of lesson durations
      duration: fmt(ch.lessons.reduce((sum, l) => (typeof l.duration === 'number' ? sum + l.duration : sum), 0)),
      lectures: ch.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        duration: fmt(l.duration),
        type: l.type === 'article' ? 'article' : 'video',
        url: l.content,
        content: l.content,
        completionStatus: l.completionStatus
      }))
    }))
  }, [courseData])

  const handleSelectLecture = (lecture: UILecture) => {
    // Convert UILecture (sidebar item) to domain Lesson type
    setCurrentLecture({
      id: String(lecture.id),
      title: lecture.title,
      content: lecture.url,
      duration: null,
      position: null,
      type: lecture.type === 'article' ? 'article' : 'video',
      completionStatus: lecture.completionStatus || 'NOT_STARTED'
    })
  }

  // Initialize the first lecture as current
  useEffect(() => {
    if (!currentLecture && uiSections.length && uiSections[0].lectures.length) {
      const first = uiSections[0].lectures[0]
      setCurrentLecture({
        id: String(first.id),
        title: first.title,
        content: first.url,
        duration: null,
        position: null,
        type: first.type === 'article' ? 'article' : 'video',
        completionStatus: first.completionStatus || 'NOT_STARTED'
      })
    }
  }, [currentLecture, uiSections])

  return (
    <div className='h-screen flex flex-col bg-[#fafafa] overflow-hidden'>
      {/* Header */}
      <header className='z-50 sticky top-0'>
        <HighGlossBackground className='shadow-lg text-white border-b border-white/10 px-3 md:px-6 py-2 md:py-3 overflow-hidden'>
          <div className='flex items-center justify-between w-full h-full relative z-10'>
            <div className='flex items-center gap-2 md:gap-4 min-w-0'>
              <button
                className='ml-1 md:ml-2 flex items-center gap-2 text-white hover:text-blue-300 transition-colors flex-shrink-0'
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className='w-4 md:w-5 h-4 md:h-5' />
                <span className='text-xs md:text-sm cursor-pointer font-bold tracking-tight uppercase hidden sm:inline'>
                  Trở lại
                </span>
              </button>
              <div className='hidden sm:block w-px h-6 bg-white/20' />
              <Button
                className='!bg-transparent !hover:bg-white/10 !shadow-none !p-2 !rounded-xl transition-all min-w-0 flex-1'
                onClick={() => navigate('/course/' + courseId)}
              >
                <div className='text-xs md:text-sm font-bold flex gap-3 items-center min-w-0'>
                  <Avatar className='h-8 w-8 md:h-9 md:w-9 flex-shrink-0 animate-in zoom-in-50 duration-500 shadow-inner'>
                    <AvatarImage src={courseData?.thumbnailUrl} />
                    <AvatarFallback>LN</AvatarFallback>
                  </Avatar>
                  <div className='flex flex-col items-start min-w-0'>
                    <span className='truncate w-full tracking-tight'>{courseData?.title}</span>
                    <span className='text-[9px] text-blue-200/60 uppercase tracking-widest'>Đang trong lộ trình học</span>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </HighGlossBackground>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden flex-col lg:flex-row'>
        {/* Left Column - Video & Tabs */}
        <div className='flex-1 flex flex-col overflow-y-auto px-3 md:px-6 py-3 md:py-4 lg:border-r lg:border-border'>
          {isLoading ? (
            <>
              <CourseSkeleton />
              <div className='mt-2 mx-auto w-full'>
                <TabNavigationSkeleton />
              </div>
            </>
          ) : currentLecture ? (
            <div className='animate-in fade-in slide-in-from-bottom-2 duration-500'>
              <LessonViewer
                ref={viewerRef}
                lesson={currentLecture!}
                subtitlesRaw={analysisData?.subtitles ?? undefined}
                chunks={analysisData?.chunks ?? []}
                isInvalid={analysisData?.status?.toLowerCase() === 'failed'}
                qualityReason={analysisData?.qualityReason}
                onShowChunkDetails={handleShowChunkDetails}
              />
              <div className='mt-2 mx-auto w-full'>
                <TabNavigation
                  currentLecture={currentLecture!}
                  thumbnailUri={courseData?.thumbnailUrl as string}
                  currentLectureId={currentLecture!.id}
                  instructorId={(courseData?.instructor as any)?.id || ''}
                  analysisData={analysisData}
                  onSeek={handleSeek}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  selectedChunkId={selectedChunkId}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column - Course Sidebar (Desktop) */}
        <div className='hidden lg:flex lg:flex-col lg:w-96 flex-shrink-0 border-l border-border'>
          {isLoading ? (
            <CourseSidebarSkeleton />
          ) : (
            <CourseSidebar
              sections={uiSections}
              currentLectureId={currentLecture?.id || ''}
              onSelectLecture={handleSelectLecture}
              onSeek={handleSeek}
            />
          )}
        </div>

        {/* Mobile Sidebar (Below video on mobile, beside on desktop) */}
        <div className='w-full lg:hidden lg:w-96 flex-shrink-0 border-t lg:border-l lg:border-t-0 border-border'>
          {isLoading ? (
            <CourseSidebarSkeleton />
          ) : (
            <CourseSidebar
              sections={uiSections}
              currentLectureId={currentLecture?.id || ''}
              onSelectLecture={handleSelectLecture}
              onSeek={handleSeek}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursePage
