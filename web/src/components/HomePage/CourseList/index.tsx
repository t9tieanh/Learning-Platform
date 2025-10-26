import CourseCard from '@/components/common/CourseCard'
import { Course } from '@/types/course.type'
import { useEffect, useState } from 'react'
import { Loader } from '@/components/ui/loader'
interface CourseListProps {
  title: string
  fetcher: () => Promise<any>
}

const CourseList = ({ title, fetcher }: CourseListProps) => {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetcher()
      .then((data: any) => setCourses(data.result))
      .catch((err) => console.error('Lỗi khi load best seller:', err))
      .finally(() => setLoading(false))
  }, [fetcher, title])

  if (loading) {
    return <Loader />
  }

  return (
    <div className='course-list-container mt-12'>
      <div className='flex items-center mt-6'>
        <div className='shrink-0' style={{ width: '320px' }}>
          <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl pl-12'>{title}</h4>
        </div>
        <div className='flex-1 flex justify-end'>
          <a href='/courses' className='text-blue-500 hover:underline text-lg mt-2 mr-12'>
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
