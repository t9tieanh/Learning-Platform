import CourseCard from '@/components/common/CourseCard'
import { Course } from '@/types/course.type'
import { useEffect, useState } from 'react'
import { Loader } from '@/components/ui/loader'
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
        console.log('RESULT', result)
        // Nếu không có dữ liệu, fallback sang best seller
        if (!result || result.length === 0) {
          const fallback = await courseService.getBestSellerCourses()
          setCourses(fallback?.result || [])
          setFinalTitle('Khóa học bán chạy nhất')
        } else {
          setCourses(result)
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
    return <Loader />
  }

  return (
    <div className='course-list-container pt-10'>
      <div className='flex items-center mt-6'>
        <div className='shrink-0' style={{ width: '320px' }}>
          <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl pl-12'>{title}</h4>
        </div>
        <div className='flex-1 flex justify-end'>
          <a href='/courses' className='text-blue-500 hover:underline text-sm mt-2 mr-12'>
            Xem tất cả
          </a>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 mx-auto max-w-7xl px-4'>
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </div>
  )
}

export default CourseList
