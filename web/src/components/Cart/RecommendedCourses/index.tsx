import { FaSearch } from 'react-icons/fa'
import CourseCard from '@/components/common/CourseCard'

const RecommendedCourses = () => {
  return (
    <div className='recommended-courses'>
      <div className='total-cart-item'>
        <p className='text-lg font-semibold mb-1 flex items-center'>
          <FaSearch />
          &nbsp;Các khóa học bạn có thể quan tâm
        </p>
        <hr />
        <div className='mt-2'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mt-6 max-w-7xl px-4 mx-auto'>
            <CourseCard
              course={{
                id: 1,
                title: 'Khóa học 1',
                price: '100.000 VNĐ',
                image: 'https://files.fullstack.edu.vn/f8-prod/courses/19/66aa28194b52b.png'
              }}
              className='max-h-80'
            />
            <CourseCard
              course={{
                id: 2,
                title: 'Khóa học 2',
                price: '200.000 VNĐ',
                image: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
              }}
              className='max-h-80'
            />
            <CourseCard
              course={{
                id: 3,
                title: 'Khóa học 3',
                price: '300.000 VNĐ',
                image: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
              }}
              className='max-h-80'
            />
            <CourseCard
              course={{
                id: 3,
                title: 'Khóa học 3',
                price: '300.000 VNĐ',
                image: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
              }}
              className='max-h-80'
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendedCourses
