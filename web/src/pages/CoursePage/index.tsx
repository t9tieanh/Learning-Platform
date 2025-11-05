import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft } from 'lucide-react'
import { LessonViewer } from '@/components/CoursePage/LessonViewer'
import { TabNavigation } from '@/components/CoursePage/TabNavigation'
import { CourseSidebar } from '@/components/CoursePage/CourseSidebar'
import { Button } from '@/components/ui/button'
import { CourseHeader } from '@/components/CoursePage/CourseHeader'
import { CourseDetail, Lesson } from '@/types/course-student'
import courseService from '@/services/course/course-student.service'
import { useParams } from 'react-router-dom'

const CoursePage = () => {
  type UILecture = { id: number; title: string; duration: string; type: 'video' | 'pdf'; url: string }
  const { courseId } = useParams<{ courseId: string }>()
  const [courseData, setCourseData] = useState<CourseDetail | null>(null)

  const [currentLecture, setCurrentLecture] = useState<Lesson>()
  const [currentLectureId, setCurrentLectureId] = useState<number>(-1)
  const [completedLectures, setCompletedLectures] = useState<Set<number>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!courseId) return
      try {
        const response = await courseService.getCourseDetails(courseId)
        if (response && response.code === 200 && response.result) {
          setCourseData(response.result)
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
        type: 'video',
        url: l.content
      }))
    }))
  }, [courseData])

  // Load completed lectures from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('completedLectures')
    if (saved) {
      setCompletedLectures(new Set(JSON.parse(saved)))
    }
  }, [])

  // Save completed lectures to localStorage
  useEffect(() => {
    localStorage.setItem('completedLectures', JSON.stringify(Array.from(completedLectures)))
  }, [completedLectures])

  const handleToggleComplete = (lectureId: number) => {
    setCompletedLectures((prev) => {
      const next = new Set(prev)
      if (next.has(lectureId)) {
        next.delete(lectureId)
      } else {
        next.add(lectureId)
      }
      return next
    })
  }

  const handleSelectLecture = (lecture: UILecture) => {
    // Convert UILecture (sidebar item) to domain Lesson type
    setCurrentLecture({
      id: String(lecture.id),
      title: lecture.title,
      content: lecture.url,
      duration: null,
      position: null,
      type: lecture.type === 'pdf' ? 'article' : 'video'
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
        type: first.type === 'pdf' ? 'article' : 'video'
      })
      setCurrentLectureId(first.id)
    }
  }, [currentLecture, uiSections])

  return (
    <div className='min-h-screen bg-background flex flex-col'>
      {/* Header */}
      <header className='bg-blue-500 text-white border-b border-border px-6 py-3 flex items-center justify-between '>
        <div className='flex items-center gap-4'>
          <button className='flex items-center gap-2 text-white hover:text-foreground transition-colors'>
            <ChevronLeft className='w-5 h-5' />
            <span className='text-sm'>Home</span>
          </button>
          <div className='hidden sm:block w-px h-6 bg-border' />
          <h1 className='text-sm font-medium hidden sm:block'>{courseData?.title}</h1>
        </div>
        <div className='flex items-center gap-2'>
          <Button variant='outline' size='default' className='hidden md:flex bg-blue-500 border-2'>
            Ghi chú
          </Button>
          <Button variant='outline' size='default' className='hidden md:flex bg-blue-500 border-2'>
            Chia sẻ
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className='flex-1 flex overflow-hidden'>
        {/* Left Column - Video & Tabs */}
        <div className='flex-1 flex flex-col overflow-y-auto'>
          <div className='p-6'>{currentLecture && <LessonViewer lesson={currentLecture} />}</div>
          <TabNavigation />
          <div className='p-6'>
            <CourseHeader courseData={{ title: courseData?.title || '', description: courseData?.longDescription }} />
          </div>
        </div>

        {/* Right Column - Course Sidebar (Desktop) */}
        <div className='hidden lg:block'>
          <CourseSidebar
            sections={uiSections}
            currentLectureId={currentLectureId}
            completedLectures={completedLectures}
            onSelectLecture={handleSelectLecture}
            onToggleComplete={handleToggleComplete}
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
                completedLectures={completedLectures}
                onSelectLecture={handleSelectLecture}
                onToggleComplete={handleToggleComplete}
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
