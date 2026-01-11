import CourseCard from '@/components/common/CourseCard'
import CourseCardSkeleton from '@/components/HomePage/CourseCardSkeleton'
import { Course } from '@/types/course.type'
import { useEffect, useState } from 'react'
import courseService from '@/services/course/course-user.service'

interface CourseListProps {
  title: string
  fetcher: () => Promise<any>
}

const CourseList = ({ title, fetcher }: CourseListProps) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [finalTitle, setFinalTitle] = useState(title)

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetcher()
        const result = data?.result || []
        if (!result || result.length === 0) {
          const fallback = await courseService.getBestSellerCourses()
          setCourses((fallback?.result as unknown as Course[]) || [])
          setFinalTitle('Khóa học bán chạy nhất')
        } else {
          setCourses(result as unknown as Course[])
          setFinalTitle(title)
        }
      } catch (err) {
        console.error('Lỗi khi load khóa học:', err)
      } finally {
        setLoading(false)
      }
    }

    loadCourses()
  }, [fetcher, title])

  if (loading) {
    return (
      <div className='course-list-container pt-10 px-4 md:px-0'>
        <div className='flex flex-col md:flex-row md:items-center mt-6 gap-4 md:gap-0'>
          <div className='shrink-0'>
            <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl pl-4 md:pl-12'>{title}</h4>
          </div>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 mx-auto max-w-7xl'>
          {[...Array(4)].map((_, idx) => (
            <CourseCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className='course-list-container pt-10 px-4 md:px-0'>
      <div className='flex flex-col md:flex-row md:items-center mt-6 gap-4 md:gap-0'>
        <div className='shrink-0'>
          <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl pl-4 md:pl-12'>{title}</h4>
        </div>
        <div className='flex-1 flex justify-end'>
          <a href='/courses' className='text-blue-500 hover:underline text-sm md:mt-2 md:mr-12'>
            Xem tất cả
          </a>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 mx-auto max-w-7xl'>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}

export default CourseList
