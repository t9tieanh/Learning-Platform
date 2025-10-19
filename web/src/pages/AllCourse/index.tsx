import { useState } from 'react'
import { CourseCard } from '@/components/AllCourse/CourseCard'
import { FilterSidebar } from '@/components/AllCourse/FilterSidebar'
import { SortBar } from '@/components/AllCourse/SortBar'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import instructorAvatar from '@/assets/images/course.jpg'

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const totalPages = 5

  const courses = [
    {
      id: 1,
      title: 'Lập trình JavaScript từ cơ bản đến nâng cao',
      description:
        'Trở thành lập trình viên JavaScript chuyên nghiệp, nắm vững ES6+, async/await, và các design patterns quan trọng',
      originalPrice: 2159000,
      salePrice: 599000,
      instructor: { name: 'Nguyễn Văn An', avatar: instructorAvatar },
      rating: 4.8,
      reviewCount: 15234,
      duration: '25 giờ',
      lectures: 186,
      level: 'Mọi cấp độ',
      isBestseller: true,
      thumbnail: instructorAvatar
    },
    {
      id: 2,
      title: 'React & Redux - Xây dựng ứng dụng thực tế',
      description:
        'Học React hooks, Redux toolkit, React Router và xây dựng các ứng dụng web hiện đại với kiến trúc component tốt nhất',
      originalPrice: 1899000,
      salePrice: 549000,
      instructor: { name: 'Trần Minh Hoàng', avatar: instructorAvatar },
      rating: 4.9,
      reviewCount: 28456,
      duration: '32 giờ',
      lectures: 245,
      level: 'Trung cấp',
      isBestseller: true,
      thumbnail: instructorAvatar
    },
    {
      id: 3,
      title: 'Node.js Backend Development Masterclass',
      description:
        'Xây dựng RESTful API, authentication với JWT, kết nối database MongoDB/PostgreSQL và deploy production',
      originalPrice: 2499000,
      salePrice: 699000,
      instructor: { name: 'Lê Thị Mai', avatar: instructorAvatar },
      rating: 4.7,
      reviewCount: 12890,
      duration: '28 giờ',
      lectures: 198,
      level: 'Nâng cao',
      isBestseller: false,
      thumbnail: instructorAvatar
    },
    {
      id: 4,
      title: 'Full Stack Web Development với MERN Stack',
      description: 'Khóa học toàn diện về MongoDB, Express, React, Node.js - Xây dựng ứng dụng full stack từ A-Z',
      originalPrice: 2999000,
      salePrice: 799000,
      instructor: { name: 'Phạm Đức Thắng', avatar: instructorAvatar },
      rating: 4.8,
      reviewCount: 19567,
      duration: '45 giờ',
      lectures: 312,
      level: 'Mọi cấp độ',
      isBestseller: true,
      thumbnail: instructorAvatar
    },
    {
      id: 5,
      title: 'TypeScript cho lập trình viên JavaScript',
      description: 'Nắm vững TypeScript, type system, generics, decorators và tích hợp vào React/Node.js projects',
      originalPrice: 1599000,
      salePrice: 449000,
      instructor: { name: 'Hoàng Văn Đạt', avatar: instructorAvatar },
      rating: 4.9,
      reviewCount: 8934,
      duration: '18 giờ',
      lectures: 142,
      level: 'Trung cấp',
      isBestseller: false,
      thumbnail: instructorAvatar
    },
    {
      id: 6,
      title: 'UI/UX Design - Thiết kế giao diện chuyên nghiệp',
      description: 'Học Figma, Adobe XD, design thinking, user research và tạo ra các sản phẩm UI/UX đẳng cấp',
      originalPrice: 1799000,
      salePrice: 499000,
      instructor: { name: 'Đỗ Thùy Linh', avatar: instructorAvatar },
      rating: 4.8,
      reviewCount: 11234,
      duration: '22 giờ',
      lectures: 165,
      level: 'Mọi cấp độ',
      isBestseller: false,
      thumbnail: instructorAvatar
    },
    {
      id: 7,
      title: 'Python cho Data Science & Machine Learning',
      description: 'Pandas, NumPy, Matplotlib, Scikit-learn và xây dựng các mô hình ML thực tế với Python',
      originalPrice: 2299000,
      salePrice: 649000,
      instructor: { name: 'Vũ Quang Huy', avatar: instructorAvatar },
      rating: 4.7,
      reviewCount: 14567,
      duration: '35 giờ',
      lectures: 228,
      level: 'Trung cấp',
      isBestseller: true,
      thumbnail: instructorAvatar
    },
    {
      id: 8,
      title: 'Digital Marketing từ cơ bản đến chuyên sâu',
      description: 'SEO, Google Ads, Facebook Ads, content marketing và xây dựng chiến lược digital marketing hiệu quả',
      originalPrice: 1999000,
      salePrice: 559000,
      instructor: { name: 'Bùi Thu Hà', avatar: instructorAvatar },
      rating: 4.6,
      reviewCount: 9876,
      duration: '20 giờ',
      lectures: 156,
      level: 'Mọi cấp độ',
      isBestseller: false,
      thumbnail: instructorAvatar
    }
  ]
  const [sortValue, setSortValue] = useState('popular')

  return (
    <div className='flex min-h-screen bg-white'>
      <FilterSidebar />

      <main className='flex-1 p-8'>
        <div className='max-w-7xl mx-auto'>
          {/* Header */}
          <div className='mb-12 text-center'>
            <h1 className='text-5xl font-bold mb-3 bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent'>
              Khám phá khóa học
            </h1>
            <p className='text-lg text-muted-foreground max-w-3xl mx-auto'>
              Tìm kiếm và lựa chọn khóa học phù hợp với mục tiêu học tập của bạn
            </p>
          </div>

          {/* Sort Bar */}
          <SortBar totalCourses={courses.length} sortValue={sortValue} onSortChange={setSortValue} />

          {/* Course List */}
          <div className='flex flex-col gap-4 mb-8'>
            {courses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>

          {/* Pagination */}
          <div className='flex items-center justify-center gap-2'>
            <Button
              variant='outline'
              size='icon'
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? 'default' : 'outline'}
                size='icon'
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}

            <Button
              variant='outline'
              size='icon'
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Index
