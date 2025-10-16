import CourseCard from '@/components/common/CourseCard'

const CourseList = () => {
  return (
    <div className='course-list-container mt-12'>
      <div className='flex items-center mt-6'>
        <div className='shrink-0' style={{ width: '320px' }}>
          <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl pl-12'>Danh sách khóa học</h4>
        </div>
        <div className='flex-1 flex justify-end'>
          <a href='/courses' className='text-blue-500 hover:underline text-lg mt-2 mr-12'>
            Xem tất cả
          </a>
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6 mx-auto max-w-7xl px-4'>
        <CourseCard
          course={{
            id: 1,
            title: 'Khóa học 1',
            price: '100.000 VNĐ',
            image: 'https://files.fullstack.edu.vn/f8-prod/courses/19/66aa28194b52b.png'
          }}
        />
        <CourseCard
          course={{
            id: 2,
            title: 'Khóa học 2',
            price: '200.000 VNĐ',
            image: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
          }}
        />
        <CourseCard
          course={{
            id: 3,
            title: 'Khóa học 3',
            price: '300.000 VNĐ',
            image: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
          }}
        />
        <CourseCard
          course={{
            id: 4,
            title: 'Khóa học 4',
            price: '400.000 VNĐ',
            image: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
          }}
        />
      </div>
    </div>
  )
}

export default CourseList
