import CourseSection, { Section } from './detail/Sections'
import './style.scss'
import Requirement from './detail/Requirements'
import TeacherInfo from './detail/TeacherInfo'
import { Accordion } from '@/components/ui/accordion'

const CourseContent = ({
  requirements,
  sections,
  content,
  instructor
}: {
  requirements: string[]
  sections: Section[]
  content: string
  instructor: {
    id: string
    name: string
    image: string
    phone: string
    description: string
    email: string
    username: string | null
    numCourse: number
    expertise: {
      id: string
      name: string
      image: string
    }[]
  }
}) => {
  return (
    <div className='course-content-container min-h-24 pt-0 pb-12'>
      <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-80 pl-12'>Nội dung của khóa học</h4>
      <div className='content-accordion-container text-left ml-12 mt-6'>
        <Accordion type='single' collapsible className='w-full space-y-4'>
          {sections?.map((section, index) => (
            <CourseSection key={index} section={section} index={index} />
          ))}
        </Accordion>
      </div>
      {/* requirements */}
      <div className='py-6'>
        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-80 pl-12'>Bạn nên chuẩn bị gì</h4>
      </div>
      <Requirement requirements={requirements} />
      {/* description */}
      <div className='py-6'>
        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-80 pl-12'>Mô tả chi tiết</h4>
      </div>
      <div className='text-base max-w-3xl ml-12 text-justify leading-relaxed font-normal text-gray-700'>
        {/* content of course */}
        <div dangerouslySetInnerHTML={{ __html: content }} />
      </div>
      <div className='py-6'>
        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-80 pl-12'>Thông tin giáo viên</h4>
      </div>
      <TeacherInfo teacher={instructor} />
    </div>
  )
}

export default CourseContent
