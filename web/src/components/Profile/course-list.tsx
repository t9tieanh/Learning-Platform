import CourseCard, { CourseCardProps } from '@/components/Profile/course-cart'

const courseMockData: CourseCardProps[] = [
  {
    id: 'course1',
    title: 'Khóa học React từ cơ bản đến nâng cao',
    description: 'Học cách xây dựng ứng dụng web hiện đại với React.js',
    instructor: {
      name: 'Nguyễn Văn A',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    rating: 4.5,
    reviewCount: 120,
    duration: '10 giờ',
    lectures: 50,
    level: 'Cơ bản',
    thumbnail: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
  },
  {
    id: 'course2',
    title: 'Lập trình Python cho người mới bắt đầu',
    description: 'Khám phá thế giới lập trình với Python từ những bước đầu tiên',
    instructor: {
      name: 'Trần Thị B',
      avatar: 'https://randomuser.me/api/portraits/women/2.jpg'
    },
    rating: 4.7,
    reviewCount: 200,
    duration: '15 giờ',
    lectures: 70,
    level: 'Cơ bản',
    thumbnail: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
  },
  {
    id: 'course3',
    title: 'Phát triển ứng dụng di động với Flutter',
    description: 'Tạo ứng dụng di động đa nền tảng nhanh chóng và hiệu quả với Flutter',
    instructor: {
      name: 'Lê Văn C',
      avatar: 'https://randomuser.me/api/portraits/men/3.jpg'
    },
    rating: 4.6,
    reviewCount: 150,
    duration: '12 giờ',
    lectures: 60,
    level: 'Trung cấp',
    thumbnail: 'https://files.fullstack.edu.vn/f8-prod/courses/12.png'
  }
]

const CourseList = () => {
  return (
    <div className='cart-section p-5 bg-white rounded-lg'>
      <div className='total-cart-item'>
        <p className='text-sm font-semibold mb-1 flex items-center'>Bạn đang sỡ hữu 8 khóa học !</p>
        <hr />
      </div>
      <div className='cart-item flex flex-col p-4 gap-4'>
        {courseMockData.map((item, index) => (
          <CourseCard key={index} {...item} />
        ))}
      </div>
    </div>
  )
}

export default CourseList
