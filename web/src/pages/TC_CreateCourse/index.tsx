import { useState } from 'react'
import CourseSidebar from '@/components/TC_CreateCourse/CourseSidebar'
import CurriculumForm from '@/components/TC_CreateCourse/CurriculumForm'
import LandingPageForm from '@/components/TC_CreateCourse/LandingPageForm'
import PricingForm from '@/components/TC_CreateCourse/PricingForm'
import SetupForm from '@/components/TC_CreateCourse/SetupForm/SetupForm'
import { useParams } from 'react-router-dom'
import CourseProgressStep from '@/types/courseProgressStep'

const TC_CreateCourse = () => {
  const [activeSection, setActiveSection] = useState<CourseProgressStep>(CourseProgressStep.INTRO)

  const { id } = useParams<{ id: string }>()

  const renderContent = () => {
    switch (activeSection) {
      case CourseProgressStep.CURRICULUM:
        return <CurriculumForm id={id as string} />
      case CourseProgressStep.PRICING:
        return <PricingForm />
      case CourseProgressStep.SETTINGS:
        return <SetupForm />
      default:
        return <LandingPageForm id={id as string} setActiveSection={setActiveSection} />
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
