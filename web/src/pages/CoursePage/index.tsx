import { useMemo, useState, useEffect } from 'react'
import { ChevronLeft, Brain, Sparkles } from 'lucide-react'
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
  const [currentLectureId, setCurrentLectureId] = useState<string>()
  const navigate = useNavigate()

  // MOCK AI DATA for the demo
  const mockAnalysisData: AnalysisResult = {
    lessonId: 'mock-lesson-id',
    status: 'completed',
    summary: 'Trong bài giảng này, chúng ta sẽ tìm hiểu về các khái niệm cơ bản của phát triển web hiện đại. Chúng ta sẽ bắt đầu bằng việc tìm hiểu cách trình duyệt hoạt động, sau đó là cấu trúc của một ứng dụng React và cách quản lý state hiệu quả. Cuối cùng, chúng ta sẽ xem xét cách tối ưu hóa hiệu suất cho các ứng dụng quy mô lớn.',
    suggestedTitle: 'Phát triển Web Hiện đại: Từ Cơ bản đến Nâng cao',
    subtitles: `1\n00:00:00,000 --> 00:00:05,000\nChào mừng các bạn đến với khóa học phát triển web hiện đại.\n\n2\n00:00:05,000 --> 00:00:10,000\nHôm nay chúng ta sẽ bắt đầu với bài học đầu tiên về kiến trúc trình duyệt.\n\n3\n00:00:10,000 --> 00:00:15,000\nViệc hiểu cách trình duyệt render trang web là cực kỳ quan trọng...`,
    chunks: [
      {
        id: 'c1',
        chunkIndex: 1,
        title: 'Giới thiệu về kiến trúc trình duyệt',
        startTime: '00:00:00',
        endTime: null,
        timestamp: null,
        sentenceCount: null,
        summary: 'Tổng quan về cách trình duyệt nhận dữ liệu và bắt đầu quá trình phân tích HTML/CSS để xây dựng DOM và CSSOM tree.'
      },
      {
        id: 'c2',
        chunkIndex: 2,
        title: 'Cơ chế Rendering và Paint',
        startTime: '00:02:15',
        endTime: null,
        timestamp: null,
        sentenceCount: null,
        summary: 'Đi sâu vào quá trình Layout, Paint và Composite. Giải thích tại sao một số thuộc tính CSS lại hiệu quả hơn về mặt hiệu năng so với các thuộc tính khác.'
      },
      {
        id: 'c3',
        chunkIndex: 3,
        title: 'Tối ưu hóa Critical Rendering Path',
        startTime: '00:05:45',
        endTime: null,
        timestamp: null,
        sentenceCount: null,
        summary: 'Các kỹ thuật để giảm thời gian load trang và cải thiện Core Web Vitals thông qua việc tối ưu hóa chuỗi render quan trọng.'
      }
    ]
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
        } else {
          console.log(response.message || 'Failed to fetch course details')
        }
      } catch (error) {
        console.log('Failed to fetch course details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCourseInfo()
  }, [courseId])

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
    setCurrentLectureId(lecture.id)
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
      setCurrentLectureId(first.id)
    }
  }, [currentLecture, uiSections])

  return (
    <div className='min-h-screen flex flex-col bg-[#fafafa]'>
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
              <LessonViewer lesson={currentLecture} />
              <div className='mt-2 mx-auto w-full'>
                <TabNavigation
                  currentLecture={currentLecture}
                  thumbnailUri={courseData?.thumbnailUrl as string}
                  currentLectureId={currentLectureId as string}
                  instructorId={(courseData?.instructor as any)?.id || ''}
                  analysisData={mockAnalysisData}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Right Column - Course Sidebar (Desktop) */}
        <div className='hidden lg:flex lg:flex-col lg:w-96 flex-shrink-0 border-l border-border overflow-y-auto'>
          {isLoading ? (
            <CourseSidebarSkeleton />
          ) : (
            <CourseSidebar
              sections={uiSections}
              currentLectureId={currentLectureId as string}
              onSelectLecture={handleSelectLecture}
            />
          )}
        </div>

        {/* Mobile Sidebar (Below video on mobile, beside on desktop) */}
        <div className='w-full lg:hidden lg:w-96 flex-shrink-0 border-t lg:border-l lg:border-t-0 border-border overflow-y-auto'>
          {isLoading ? (
            <CourseSidebarSkeleton />
          ) : (
            <CourseSidebar
              sections={uiSections}
              currentLectureId={currentLectureId as string}
              onSelectLecture={handleSelectLecture}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default CoursePage
