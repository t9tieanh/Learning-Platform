import { useState, useEffect } from 'react'
import { ChevronLeft, Menu } from 'lucide-react'
import { LessonViewer } from '@/components/CoursePage/LessonViewer'
import { TabNavigation } from '@/components/CoursePage/TabNavigation'
import { CourseSidebar } from '@/components/CoursePage/CourseSidebar'
import { Button } from '@/components/ui/button'
import { CourseHeader } from '@/components/CoursePage/CourseHeader'

interface Lecture {
  id: number
  title: string
  duration: string
  type: 'video' | 'pdf'
  url: string
}

interface Section {
  title: string
  duration: string
  lectures: Lecture[]
}

interface CourseData {
  title: string
  sections: Section[]
  createdAt?: Date
  description?: string
}

const courseData: CourseData = {
  title: 'AI Video School Complete Beginner to Pro, Veo3 Runway & more',
  createdAt: new Date(2021, 3, 19),
  description:
    'This section will contain the course content based on the selected tab. You can add descriptions, Q&A, notes,and other learning materials here.',
  sections: [
    {
      title: 'Section 1: Start Here',
      duration: '45min',
      lectures: [
        {
          id: 1,
          title: 'Welcome to the Course',
          duration: '5min',
          type: 'video',
          url: 'https://res.cloudinary.com/dijyyybm2/video/upload/v1745417483/Download_3_irdbjq.mp4'
        },
        {
          id: 2,
          title: 'Course PDF Guide',
          duration: '10min',
          type: 'pdf',
          url: 'https://res.cloudinary.com/dvkww1l4o/raw/upload/v1760433619/reports/68ee1591cf2f8284949a620f.pdf'
        }
      ]
    },
    {
      title: 'Section 2: AI Fundamentals',
      duration: '58min',
      lectures: [
        {
          id: 12,
          title: 'The Foundation of AI: Get Your Prompting Right',
          duration: '16min',
          type: 'video',
          url: 'https://res.cloudinary.com/dijyyybm2/video/upload/v1745417483/Download_3_irdbjq.mp4'
        }
      ]
    }
  ]
}
const CoursePage = () => {
  const [currentLecture, setCurrentLecture] = useState<Lecture>(courseData.sections[0].lectures[0])
  const [completedLectures, setCompletedLectures] = useState<Set<number>>(new Set())
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  const handleSelectLecture = (lecture: Lecture) => {
    setCurrentLecture(lecture)
    setSidebarOpen(false)
  }

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
          <h1 className='text-sm font-medium hidden sm:block'>{courseData.title}</h1>
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
          <div className='p-6'>
            <LessonViewer url={currentLecture.url} title={currentLecture.title} type={currentLecture.type} />
          </div>
          <TabNavigation />
          <div className='p-6'>
            <CourseHeader courseData={courseData} />
          </div>
        </div>

        {/* Right Column - Course Sidebar (Desktop) */}
        <div className='hidden lg:block'>
          <CourseSidebar
            sections={courseData.sections}
            currentLectureId={currentLecture.id}
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
                sections={courseData.sections}
                currentLectureId={currentLecture.id}
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
