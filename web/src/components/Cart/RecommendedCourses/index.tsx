import { FaSearch } from 'react-icons/fa'
import CourseCard from '@/components/Cart/RecommendedCourses/coursecart'
import courseUserService from '@/services/course/course-user.service'
import { useEffect, useState } from 'react'
import { Course } from '@/types/course.type'

const RecommendedCourses = () => {
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const response = await courseUserService.getBestSellerCourses(4)
        if (response && response.code === 200 && response.result) {
          setCourses(response.result as unknown as Course[])
        } else {
          console.error('Không thể tải chi tiết khóa học')
        }
      } catch (error) {
        console.error('Không thể tải chi tiết khóa học', error)
      }
    }

    fetchCourseDetail()
  }, [])

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
