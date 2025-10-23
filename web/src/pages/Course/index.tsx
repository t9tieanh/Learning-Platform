/* eslint-disable react/no-unescaped-entities */
import Cover from '@/components/Course/Cover'
import WhatYouWillLearn from '@/components/Course/WhatYouWillLearn'
import CoursePurchaseBox from '@/components/Course/CoursePurchaseBox'
import CourseContent from '@/components/Course/CourseContent'
import Feedback from '@/components/Course/Feedback'

const Course = () => {
  return (
    <div className='course-page bg-white'>
      <Cover
        video='https://i.ytimg.com/vi/5yHpfICfx_k/maxresdefault.jpg'
        title='Học chỉnh sửa video với Adobe Premiere Pro cho người mới bắt đầu (2025)'
        shortDescription='Trong khóa học này, bạn sẽ học các kiến thức cơ bản về chỉnh sửa video bằng Adobe Premiere Pro. Dù bạn là người mới hoàn toàn hay đã có chút kinh nghiệm, khóa học này sẽ giúp bạn tạo ra những video chất lượng chuyên nghiệp.'
        teacher={{
          name: 'Phạm Tiến Anh',
          avatar: 'https://i.pravatar.cc/150?img=3'
        }}
      />
      <WhatYouWillLearn />
      <div className='grid grid-cols-3 gap-4 bg-white'>
        <div className='col-span-2'>
          <CourseContent />
        </div>
        <div className='col-span-1'>
          <CoursePurchaseBox />
        </div>
      </div>
      <div className='feedback-container w-full py-10 bg-blue-200'>
        <Feedback />
      </div>
    </div>
  )
}

export default Course
