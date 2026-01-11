/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { useState, useEffect, useMemo } from 'react'
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

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseId) return
      setIsLoading(true)
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
    <div className='min-h-screen flex flex-col'>
      {/* Header */}
      <header className='bg-[#0C356A] shadow-lg text-white border-b border-border px-3 md:px-6 py-2 md:py-3 flex items-center justify-between'>
        <div className='flex items-center gap-2 md:gap-4 min-w-0'>
          <button
            className='ml-1 md:ml-2 flex items-center gap-2 text-white hover:text-primary transition-colors flex-shrink-0'
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className='w-4 md:w-5 h-4 md:h-5' />
            <span className='text-xs md:text-sm cursor-pointer hover:underline hidden sm:inline'>Trở lại</span>
          </button>
          <div className='hidden sm:block w-px h-6 bg-border' />
          <Button
            className='!bg-transparent !hover:bg-transparent !shadow-none !p-0 !hover:bg-blue-800 min-w-0 flex-1'
            onClick={() => navigate('/course/' + courseId)}
          >
            <div className='text-xs md:text-sm font-medium flex gap-2 items-center min-w-0'>
              <Avatar className='h-8 w-8 md:h-10 md:w-10 flex-shrink-0'>
                <AvatarImage src={courseData?.thumbnailUrl} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <span className='truncate'>{courseData?.title}</span>
            </div>
          </Button>
        </div>
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
            <>
              <LessonViewer lesson={currentLecture} />
              <div className='mt-2 mx-auto w-full'>
                <TabNavigation
                  currentLecture={currentLecture}
                  thumbnailUri={courseData?.thumbnailUrl as string}
                  currentLectureId={currentLectureId as string}
                  instructorId={(courseData?.instructor as any)?.id || ''}
                />
              </div>
            </>
          ) : null}
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
      </div>
    </div>
  )
}

export default CoursePage
