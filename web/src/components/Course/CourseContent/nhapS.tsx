import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import CourseSections from './detail/Sections'
import Requirements from './detail/Requirements'
import TeacherInfo from './detail/TeacherInfo'
import { FaUserGraduate } from 'react-icons/fa'

const CourseContent = () => {
  const requirements = [
    'Bạn cần có máy tính cá nhân với kết nối internet ổn định để đảm bảo quá trình học tập không bị gián đoạn.',
    'Kiến thức nền tảng về HTML và CSS sẽ giúp bạn dễ dàng tiếp cận các khái niệm mới trong khóa học này.',
    'Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt Node.js và npm để có thể chạy các ví dụ thực hành và cài đặt các thư viện cần thiết.',
    'Tinh thần học hỏi, chủ động tìm hiểu và không ngại thử nghiệm là yếu tố quan trọng giúp bạn tiến bộ nhanh hơn.',
    'Khả năng đọc hiểu tài liệu tiếng Anh sẽ giúp bạn tiếp cận nhiều nguồn kiến thức và giải quyết các vấn đề kỹ thuật hiệu quả hơn.',
    'Bạn nên có tài khoản Github để lưu trữ, quản lý mã nguồn và chia sẻ các dự án thực hành với cộng đồng.'
  ]

  return (
    <div className='course-content-container py-6 pr-4 bg-gradient-subtle'>
      <div className='max-w-6xl mt-6'>
        {/* Course Content Section */}
        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-md text-center flex'>
          &nbsp;Nội dung của khóa học này ?
        </h4>
        <Card className='shadow-none border-0 overflow-hidden mx-12'>
          <CardContent className='p-4'>
            <CourseSections />
          </CardContent>
        </Card>

        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-md text-center flex mt-2'>
          &nbsp;Yêu cầu trước của khóa học này ?
        </h4>
        {/* Requirements Section */}
        <Card className='shadow-none border-0 overflow-hidden mx-12'>
          <CardContent className='p-6 pt-2'>
            <Requirements requirements={requirements} />
          </CardContent>
        </Card>

        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-md text-center flex mt-0'>
          <FaUserGraduate />
          &nbsp;Giới thiệu giảng viên
        </h4>
        {/* Teacher Info Section */}
        <Card className='shadow-none border-0 overflow-hidden mx-12'>
          <CardContent className='p-6'>
            <TeacherInfo />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CourseContent
