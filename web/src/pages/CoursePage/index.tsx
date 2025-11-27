import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { LessonViewer } from '@/components/CoursePage/LessonViewer'
import { TabNavigation } from '@/components/CoursePage/TabNavigation'
import { CourseSidebar } from '@/components/CoursePage/CourseSidebar'
import { CourseDetail, Lesson } from '@/types/course-student'
import courseService from '@/services/course/course-student.service'
import { useParams, useNavigate } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const CoursePage = () => {
  type UILecture = {
    id: number
    title: string
    duration: string
    type: 'video' | 'article'
    content: string
    url: string
    completionStatus?: 'NOT_STARTED' | 'COMPLETED'
  }
  const { courseId } = useParams<{ courseId: string }>()
  const [courseData, setCourseData] = useState<CourseDetail | null>(null)

  const [currentLecture, setCurrentLecture] = useState<Lesson>()
  const [currentLectureId, setCurrentLectureId] = useState<number>(-1)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseId) return
      try {
        const response = await courseService.getCourseDetails(courseId)
        if (response && response.code === 200 && response.result) {
          setCourseData(response.result)

          // select lecture introdution
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
    setSidebarOpen(false)
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
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className='bg-[#0C356A] shadow-lg text-white border-b border-border px-6 py-3 flex items-center justify-between '>
        <div className='flex items-center gap-4'>
          <button
            className='ml-2 flex items-center gap-2 text-white hover:text-foreground transition-colors hover:text-primary'
            onClick={() => navigate('/')}
          >
            <ChevronLeft className='w-5 h-5' />
            <span
              className='text-sm cursor-pointer hover:underline'
              onClick={() => navigate(-1)}
            >
              Trở lại
            </span>
          </button>
          <div className='hidden sm:block w-px h-6 bg-border' />
          <div className='text-sm font-medium sm:block !flex gap-2 items-center'>
            <Avatar>
              <AvatarImage src={courseData?.thumbnailUrl} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            {courseData?.title}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Left Column - Video & Tabs */}
        <div className='flex-1 flex flex-col overflow-y-auto px-6 py-4'>
          {currentLecture && (
            <>
              <LessonViewer lesson={currentLecture} />
              <div className='mt-2 mx-auto w-full'>
                <TabNavigation
                  currentLecture={currentLecture}
                  thumbnailUri={courseData?.thumbnailUrl as string}
                  currentLectureId={currentLectureId}
                  instructorId={courseData?.instructor?.id}
                />
              </div>
            </>
          )}
        </div>

        {/* Right Column - Course Sidebar (Desktop) */}
        <div className='hidden lg:flex lg:flex-col lg:w-96 flex-shrink-0 border-l border-border overflow-y-auto'>
          <CourseSidebar
            sections={uiSections}
            currentLectureId={currentLectureId}
            onSelectLecture={handleSelectLecture}
            onClose={() => setSidebarOpen(false)}
          />
        </div>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <>
            <div
              role='button'
              tabIndex={0}
              aria-label='Close sidebar'
              className='fixed inset-0 bg-black/50 z-40 lg:hidden'
              onClick={() => setSidebarOpen(false)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setSidebarOpen(false)
                }
              }}
            />
            <div className='fixed right-0 top-0 bottom-0 z-50 lg:hidden'>
              <CourseSidebar
                sections={uiSections}
                currentLectureId={currentLectureId}
                onSelectLecture={handleSelectLecture}
                onClose={() => setSidebarOpen(false)}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default CoursePage
