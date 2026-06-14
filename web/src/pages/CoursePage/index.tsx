import { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft } from 'lucide-react'
import { LessonViewer } from '@/components/CoursePage/LessonViewer'
import { TabNavigation } from '@/components/CoursePage/TabNavigation'
import { CourseSidebar } from '@/components/CoursePage/CourseSidebar'
import { MobileCourseDrawer } from '@/components/CoursePage/MobileCourseDrawer'
import { CourseDetail, Lesson } from '@/types/course-student'
import courseService from '@/services/course/course-student.service'
import { useParams, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Button from '@/components/common/Button'
import { CourseSkeleton } from '@/components/CoursePage/CourseSkeleton'
import { TabNavigationSkeleton } from '@/components/CoursePage/TabNavigationSkeleton'
import { CourseSidebarSkeleton } from '@/components/CoursePage/CourseSidebarSkeleton'
import assistantAnalysisService, { AnalysisResult } from '@/services/assistant/analysis.service'
import HighGlossBackground from '@/components/common/HighGlossBackground'
import CoursePageHeaderUser from '@/components/CoursePage/CoursePageHeaderUser'
import { CertificateJourneyProgress } from '@/components/CoursePage/CertificateJourneyProgress'
import CourseCompletionCelebration from '@/components/CoursePage/CourseCompletionCelebration'

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
  const [activeMobileTab, setActiveMobileTab] = useState<'content' | 'ai' | null>(null)
  const [watchedPercent, setWatchedPercent] = useState(0)
  const navigate = useNavigate()
  const viewerRef = useRef<import('@/components/CoursePage/VideoPlayer').VideoPlayerRef>(null)

  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null)
  const [showCourseCompletionModal, setShowCourseCompletionModal] = useState(false)
  const [completedCertificate, setCompletedCertificate] = useState<{
    id: string
    certificateCode: string
    courseScore?: number | null
    courseScoreTotal?: number | null
  } | null>(null)

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

  const currentLectureIdRef = useRef(currentLecture?.id)
  currentLectureIdRef.current = currentLecture?.id

  const fetchCourseInfo = useCallback(
    async (preserveLectureId?: string, options?: { silent?: boolean }) => {
      if (!courseId) return
      if (!options?.silent) setIsLoading(true)
      try {
        const response = await courseService.getCourseDetails(courseId)
        if (response && response.code === 200 && response.result) {
          setCourseData(response.result)

          const lectureIdToKeep = preserveLectureId ?? currentLectureIdRef.current
          if (lectureIdToKeep && lectureIdToKeep !== 'introduction') {
            for (const ch of response.result.chapters ?? []) {
              const found = ch.lessons?.find((l) => l.id === lectureIdToKeep)
              if (found) {
                setCurrentLecture({
                  id: found.id,
                  title: found.title,
                  content: found.content,
                  duration: found.duration ?? null,
                  position: found.position ?? null,
                  type: found.type === 'article' ? 'article' : 'video',
                  completionStatus: found.completionStatus ?? 'NOT_STARTED'
                })
                return
              }
            }
          }

          if (!options?.silent) {
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
        }
      } catch (error) {
        console.error('Failed to fetch course details', error)
      } finally {
        if (!options?.silent) setIsLoading(false)
      }
    },
    [courseId]
  )

  useEffect(() => {
    fetchCourseInfo()
  }, [fetchCourseInfo])

  const handleLessonCompleted = useCallback(() => {
    fetchCourseInfo(currentLectureIdRef.current, { silent: true })
  }, [fetchCourseInfo])

  const handleCourseCompleted = useCallback(
    (certificate?: {
      id: string
      certificateCode: string
      courseScore?: number | null
      courseScoreTotal?: number | null
    }) => {
      setCompletedCertificate(certificate ?? null)
      setShowCourseCompletionModal(true)
    },
    []
  )

  useEffect(() => {
    const fetchAnalysis = async () => {
      if (!currentLecture?.id || currentLecture.id === 'introduction') {
        setAnalysisData(null)
        return
      }

      try {
        const response = await assistantAnalysisService.getAnalysisDetail(currentLecture.id)
        if (response && response.code === 200 && response.result) {
          setAnalysisData(response.result)
        } else {
          setAnalysisData(null)
        }
      } catch (error) {
        setAnalysisData(null)
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
    setWatchedPercent(0) // Reset for new lecture
  }

  const handleNavigateToLessonTest = useCallback(
    (lessonId: string) => {
      if (!courseData) return
      for (const chapter of courseData.chapters ?? []) {
        const found = chapter.lessons?.find((lesson) => lesson.id === lessonId)
        if (!found) continue
        setCurrentLecture({
          id: found.id,
          title: found.title,
          content: found.content,
          duration: found.duration ?? null,
          position: found.position ?? null,
          type: found.type === 'article' ? 'article' : 'video',
          completionStatus: found.completionStatus ?? 'NOT_STARTED'
        })
        setWatchedPercent(found.completionStatus === 'COMPLETED' ? 100 : 0)
        setActiveTab('Bài kiểm tra')
        setActiveMobileTab(null)
        return
      }
    },
    [courseData]
  )

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
          <div className='flex h-8 items-center justify-between w-full md:h-9'>
            <div className='flex items-center gap-2 md:gap-4 min-w-0'>
              <button
                className='ml-1 md:ml-2 flex items-center gap-2 text-white hover:text-blue-300 transition-colors flex-shrink-0'
                onClick={() => navigate(-1)}
              >
                <ChevronLeft className='w-4 md:w-5 h-4 md:h-5' />
                <span className='text-xs md:text-sm cursor-pointer font-bold tracking-tight  hidden sm:inline'>
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
                    <span className='text-[9px] text-blue-200/60  tracking-widest'>Đang trong lộ trình học</span>
                  </div>
                </div>
              </Button>
            </div>

            <CoursePageHeaderUser />
          </div>
        </HighGlossBackground>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden flex-col lg:flex-row'>
        {/* Left Column - Video & Tabs */}
        <div className='flex-1 flex flex-col overflow-y-auto px-3 md:px-6 py-3 md:py-4 lg:border-r lg:border-border pb-20 lg:pb-4'>
          {isLoading ? (
            <>
              <CourseSkeleton />
              <div className='mt-2 mx-auto w-full'>
                <TabNavigationSkeleton />
              </div>
            </>
          ) : currentLecture ? (
            <>
              {/* Chỉ animate LessonViewer — transform trên ancestor làm hỏng sticky trong TabNavigation (Bản đồ câu) */}
              <div className='animate-in fade-in slide-in-from-bottom-2 duration-500'>
                <LessonViewer
                  ref={viewerRef}
                  lesson={currentLecture!}
                  courseTitle={courseData?.title}
                  subtitlesRaw={analysisData?.subtitles ?? undefined}
                  chunks={analysisData?.chunks ?? []}
                  isInvalid={analysisData?.status?.toLowerCase() === 'failed'}
                  qualityReason={analysisData?.qualityReason}
                  onShowChunkDetails={handleShowChunkDetails}
                  onProgress={(percent) => setWatchedPercent(Math.max(watchedPercent, percent))}
                  onLessonCompleted={handleLessonCompleted}
                  onCourseCompleted={handleCourseCompleted}
                />
              </div>
              <div className='mt-2 mx-auto w-full'>
                <TabNavigation
                  currentLecture={currentLecture!}
                  thumbnailUri={courseData?.thumbnailUrl as string}
                  currentLectureId={currentLecture!.id}
                  analysisData={analysisData}
                  onSeek={handleSeek}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                  selectedChunkId={selectedChunkId}
                  watchedPercent={watchedPercent}
                  onCourseCompleted={handleCourseCompleted}
                  onCourseDataRefresh={() => fetchCourseInfo(currentLectureIdRef.current, { silent: true })}
                />
              </div>
            </>
          ) : null}
        </div>

        {/* Right Column - Course Sidebar (Desktop) */}
        <div className='hidden lg:flex lg:flex-col lg:w-96 flex-shrink-0 border-l border-border overflow-y-auto'>
          {isLoading ? (
            <CourseSidebarSkeleton />
          ) : (
            <>
              {courseData?.certificateJourney && (
                <div className='p-3 border-b border-border'>
                  <CertificateJourneyProgress
                    journey={courseData.certificateJourney}
                    onNavigateToLessonTest={handleNavigateToLessonTest}
                  />
                </div>
              )}
              <CourseSidebar
                sections={uiSections}
                currentLectureId={currentLecture?.id || ''}
                onSelectLecture={handleSelectLecture}
                onSeek={handleSeek}
                subtitlesRaw={analysisData?.subtitles}
              />
            </>
          )}
        </div>

        {/* Mobile Sidebar (Expandable Bottom Drawer) */}
        <MobileCourseDrawer
          activeMobileTab={activeMobileTab}
          setActiveMobileTab={setActiveMobileTab}
          uiSections={uiSections}
          currentLectureId={currentLecture?.id || ''}
          onSelectLecture={handleSelectLecture}
          onSeek={handleSeek}
          isLoading={isLoading}
          subtitlesRaw={analysisData?.subtitles}
          certificateJourney={courseData?.certificateJourney}
          onNavigateToLessonTest={handleNavigateToLessonTest}
        />
      </div>

      <CourseCompletionCelebration
        open={showCourseCompletionModal}
        onOpenChange={setShowCourseCompletionModal}
        courseTitle={courseData?.title}
        courseThumbnailUrl={courseData?.thumbnailUrl}
        certificateId={completedCertificate?.id}
        certificateCode={completedCertificate?.certificateCode}
        courseScore={completedCertificate?.courseScore}
        courseScoreTotal={completedCertificate?.courseScoreTotal}
      />
    </div>
  )
}

export default CoursePage
