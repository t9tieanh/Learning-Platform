import CourseCard from '@/components/common/CourseCard'

const CourseList = () => {
  return (
    <div className='course-list-container'>
      <h4 className='font-bold bg-blue-500 text-white p-2 rounded-r-3xl max-w-80 text-center mt-6'>
        Danh sách khóa học của tôi
      </h4>
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
        <CourseCard
          course={{
            id: 5,
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
