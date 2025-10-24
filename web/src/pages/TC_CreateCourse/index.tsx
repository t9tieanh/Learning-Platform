import { useEffect, useState } from 'react'
import CourseSidebar from '@/components/TC_CreateCourse/CourseSidebar'
import CurriculumForm from '@/components/TC_CreateCourse/CurriculumForm'
import LandingPageForm from '@/components/TC_CreateCourse/LandingPageForm'
import PricingForm from '@/components/TC_CreateCourse/PricingForm'
import SetupForm from '@/components/TC_CreateCourse/SetupForm/SetupForm'
import { useParams } from 'react-router-dom'
import CourseProgressStep from '@/types/courseProgressStep'
import courseService from '@/services/course/course.service'

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
    introductoryVideo: '',
  })

  const { id } = useParams<{ id: string }>()

  useEffect(() => {
    const getCourseInfo = async () => {
      if (!id) return
      const response = await courseService.getCourseInfo(id)
      if (response && response.code === 200 && response.result) {
        const course = response.result
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
    }
    getCourseInfo()
  }, [])

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

  return (
    <div className='h-screen bg-background'>
      <div className='flex h-screen'>
        <CourseSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
        <main className='flex-1 p-8 min-h-screen overflow-auto'>{renderContent()}</main>
      </div>
    </div>
  )
}

export default TC_CreateCourse
