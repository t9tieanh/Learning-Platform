import { useState } from 'react'
import CourseSidebar from '@/components/TC_CreateCourse/CourseSidebar'
import CourseGoalsForm from '@/components/TC_CreateCourse/CourseGoalsForm'
import CurriculumForm from '@/components/TC_CreateCourse/CurriculumForm'
// import FilmEditForm from '@/components/TC_CreateCourse/FilmEditForm'
import CaptionsForm from '@/components/TC_CreateCourse/CaptionsForm'
import LandingPageForm from '@/components/TC_CreateCourse/LandingPageForm'
import PricingForm from '@/components/TC_CreateCourse/PricingForm'
import SetupForm from '@/components/TC_CreateCourse/SetupForm'

const TC_CreateCourse = () => {
  const [activeSection, setActiveSection] = useState('goals')

  const renderContent = () => {
    switch (activeSection) {
      // case 'goals':
      //   return <CourseGoalsForm />
      case 'curriculum':
        return <CurriculumForm />
      // case 'film':
      //   return <FilmEditForm />
      // case 'captions':
      //   return <CaptionsForm />
      case 'landing':
        return <LandingPageForm />
      case 'pricing':
        return <PricingForm />
      case 'setup':
        return <SetupForm />
      default:
        return <CourseGoalsForm />
    }
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='flex'>
        <CourseSidebar activeSection={activeSection} onSectionChange={setActiveSection} />

        <main className='flex-1 p-8'>{renderContent()}</main>
      </div>
    </div>
  )
}

export default TC_CreateCourse
