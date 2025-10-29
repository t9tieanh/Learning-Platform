import Banner from '@/components/MyCourse/banner'
import CourseList from '@/components/MyCourse/course-list'

const MyCoursePage = () => {
  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        <Banner />
        <div className='course-list'>
          <CourseList />
        </div>
      </div>
    </div>
  )
}

export default MyCoursePage
