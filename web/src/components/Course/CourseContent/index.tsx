import Sections from './detail/Sections'
import './style.scss'
import Requirement from './detail/Requirements'
import TeacherInfo from './detail/TeacherInfo'

const CourseContent = () => {
  return (
    <div className='course-content-container min-h-24 pt-0 pb-12'>
      <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-80 pl-12'>Nội dung của khóa học</h4>
      <div className='content-accordion-container text-left ml-12 mt-6'>
        <Sections />
      </div>
      {/* requirements */}
      <div className='py-6'>
        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-80 pl-12'>Bạn nên chuẩn bị gì</h4>
      </div>
      <Requirement
        requirements={[
          'Bạn cần có máy tính cá nhân với kết nối internet ổn định để đảm bảo quá trình học tập không bị gián đoạn.',
          'Kiến thức nền tảng về HTML và CSS sẽ giúp bạn dễ dàng tiếp cận các khái niệm mới trong khóa học này.',
          'Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt Node.js và npm để có thể chạy các ví dụ thực hành và cài đặt các thư viện cần thiết.',
          'Tinh thần học hỏi, chủ động tìm hiểu và không ngại thử nghiệm là yếu tố quan trọng giúp bạn tiến bộ nhanh hơn.'
        ]}
      />
      {/* description */}
      <div className='py-6'>
        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-80 pl-12'>Mô tả chi tiết</h4>
      </div>
      <div className='text-base max-w-3xl ml-12 text-justify leading-relaxed font-normal text-gray-700'>
        {/* Nội dung do người dùng nhập */}
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Inventore nulla veniam quos animi exercitationem soluta
        tenetur, repellat ad. Quod maiores sunt praesentium reiciendis necessitatibus commodi totam quidem perferendis
        unde illo. Lorem ipsum dolor sit amet consectetur adipisicing elit. Illo obcaecati minima aliquid aperiam
        doloremque quidem ab minus quasi fugiat debitis incidunt, cum aspernatur, facere voluptas nesciunt maxime
        quaerat repudiandae!
      </div>
      <div className='py-6'>
        <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-80 pl-12'>Thông tin giáo viên</h4>
      </div>
      <TeacherInfo />
    </div>
  )
}

export default CourseContent
