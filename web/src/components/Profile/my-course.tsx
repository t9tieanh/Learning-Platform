import Banner from '@/components/Profile/banner'
import CourseList from '@/components/Profile/course-list'

const MyCoursePage = () => {
  return (
    <div className='bg-white shadow-lg border-1 border-gray-200 rounded-lg'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6'>
        <Banner
          name='Khóa học của bạn'
          description='Chào mừng bạn đã trở lại, cùng bắt đầu một ngày học tập tuyệt vời nhé!'
        />
        <div className='course-list'>
          <CourseList />
        </div>
      </div>
    </div>
  )
}

export default MyCoursePage
