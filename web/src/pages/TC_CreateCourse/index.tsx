import { useEffect, useState } from 'react'
import CourseSidebar from '@/components/TC_CreateCourse/CourseSidebar'
import CurriculumForm from '@/components/TC_CreateCourse/CurriculumForm'
import LandingPageForm from '@/components/TC_CreateCourse/LandingPageForm'
import PricingForm from '@/components/TC_CreateCourse/PricingForm'
import SetupForm from '@/components/TC_CreateCourse/SetupForm/SetupForm'
import { useParams, useNavigate } from 'react-router-dom'
import CourseProgressStep from '@/types/courseProgressStep'
import courseService from '@/services/course/course.service'
import CustomButton from '@/components/common/Button'
import { ArrowLeftToLine, SendHorizontal, Menu } from 'lucide-react'
import { toast } from 'sonner'
import TC_CreateCourseSkeleton from '@/components/TC_CreateCourse/TC_CreateCourseSkeleton'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'

const TC_CreateCourse = () => {
  const [activeSection, setActiveSection] = useState<CourseProgressStep>(CourseProgressStep.INTRO)
  const [courseInfo, setCourseInfo] = useState<{
    courseTitle: string
    subtitle: string
    description: string
    language: string
    learnItems: string[]
    category: string
    requirements: string[]
    thumbnailUrl: string
    introductoryVideo: string
  }>({
    courseTitle: '',
    subtitle: '',
    description: '',
    language: '',
    learnItems: [],
    category: '',
    requirements: [],
    thumbnailUrl: '',
    introductoryVideo: ''
  })

  const [loading, setLoading] = useState(true)

  const navigate = useNavigate()

  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const getCourseInfo = async () => {
      if (!id) return
      setLoading(true)
      try {
        const response = await courseService.getCourseInfo(id)
        if (response && response.code === 200 && response.result) {
          const course = response.result
          if (course.status === 'PUBLISHED') {
            toast.error('Khóa học đã được xuất bản, không thể chỉnh sửa nữa.')
            navigate(`/course/${id}`)
            return
          }
          if (course.progressStep) {
            setActiveSection(course.progressStep as CourseProgressStep)
            setCourseInfo({
              courseTitle: course.title,
              subtitle: course.shortDescription,
              description: course.longDescription,
              language: course.language,
              learnItems: course.outcomes,
              category: course.category,
              requirements: course.requirements,
              thumbnailUrl: course.thumbnailUrl,
              introductoryVideo: course.introductoryVideo
            })
          }
        }
      } catch (error) {
        console.error('Failed to fetch course info', error)
      } finally {
        setLoading(false)
      }
    }
    getCourseInfo()
  }, [id])

  const renderContent = () => {
    switch (activeSection) {
      case CourseProgressStep.CURRICULUM:
        return <CurriculumForm id={id as string} />
      case CourseProgressStep.PRICING:
        return <PricingForm id={id as string} />
      case CourseProgressStep.SETTINGS:
        return <SetupForm id={id as string} />
      default:
        return <LandingPageForm id={id as string} courseInfo={courseInfo} />
    }
  }

  // Navigation order for the course creation steps
  const stepOrder: CourseProgressStep[] = [
    CourseProgressStep.INTRO,
    CourseProgressStep.CURRICULUM,
    CourseProgressStep.PRICING,
    CourseProgressStep.SETTINGS
  ]

  const goNext = () => {
    const idx = stepOrder.indexOf(activeSection)
    if (idx === -1) return
    const next = stepOrder[idx + 1]
    if (next) setActiveSection(next)
  }

  const goBack = () => {
    const idx = stepOrder.indexOf(activeSection)
    if (idx === -1) return
    const prev = stepOrder[idx - 1]
    if (prev) setActiveSection(prev)
  }

  if (loading) {
    return <TC_CreateCourseSkeleton />
  }

  return (
    <div className='h-screen bg-background flex flex-col'>
      {/* Mobile Header */}
      <div className='lg:hidden p-4 border-b flex items-center gap-4 bg-white dark:bg-slate-900 z-20'>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant='outline' size='icon'>
              <Menu className='h-5 w-5' />
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='p-0 w-72'>
            <CourseSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
          </SheetContent>
        </Sheet>
        <h1 className='font-semibold text-lg truncate'>Tạo khóa học</h1>
      </div>

      <div className='flex flex-1 overflow-hidden'>
        {/* Desktop Sidebar */}
        <div className='hidden lg:block h-full'>
          <CourseSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        </div>

        <main className='flex-1 p-4 md:p-8 overflow-auto flex flex-col'>
          <div className='flex-1'>
            {renderContent()}
          </div>
          <div className='max-w-6xl mx-auto flex justify-between mt-5 pb-10 w-full'>
            <CustomButton
              label='Quay lại'
              className='bg-gray-100 text-black hover:bg-gray-200'
              icon={<ArrowLeftToLine />}
              onClick={goBack}
              disabled={activeSection === stepOrder[0]}
            />
            <CustomButton
              label='Tiếp tục'
              className='bg-blue-500 text-white hover:bg-blue-600'
              icon={<SendHorizontal />}
              onClick={goNext}
              disabled={activeSection === stepOrder[stepOrder.length - 1]}
            />
          </div>
        </main>
      </div>
    </div>
  )
}

export default TC_CreateCourse
