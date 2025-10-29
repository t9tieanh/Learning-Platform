import { FaSearch } from 'react-icons/fa'
import CourseCard from '@/components/Cart/RecommendedCourses/coursecart'
import { mockCourses } from '@/data/course.mock'

const RecommendedCourses = () => {
  const courses = mockCourses.slice(0, 5)

  return (
    <div className='recommended-courses'>
      <div className='total-cart-item'>
        <p className='text-sm sm:text-sm font-semibold flex items-center gap-2 mb-3'>
          <FaSearch className='text-blue-600' />
          Các khóa học bạn có thể quan tâm
        </p>
        <hr className='mb-4' />
        <div className='my-2'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6'>
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} className='h-full' />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendedCourses
