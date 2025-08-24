import { BiSolidDetail } from 'react-icons/bi'
import Sections from './detail/Sections'
import './style.scss'
import { FaSquarePollHorizontal } from 'react-icons/fa6'
import Requirement from './detail/Requirements'
import { FaUserGraduate } from 'react-icons/fa'
import TeacherInfo from './detail/TeacherInfo'

const CourseContent = () => {
  return (
    <div className='course-content-container min-h-24 pt-5 pb-12'>
      <h4 className='font-bold bg-slate-800 text-white p-2 rounded-r-3xl max-w-md text-center flex'>
        <BiSolidDetail size={20} className='mt-1' />
        &nbsp;Nội dung của khóa hoc này ?
      </h4>
      <div className='content-accordion-container text-left ml-12 mt-6'>
        <Sections />
      </div>
      {/* requirements */}
      <h4 className='font-bold bg-slate-800 text-white p-2 rounded-r-3xl max-w-md text-center flex mt-6'>
        <FaSquarePollHorizontal size={20} className='mt-1' />
        &nbsp;Yêu cầu trước của khóa học này ?
      </h4>
      <Requirement
        requirements={[
          'Bạn cần có máy tính cá nhân với kết nối internet ổn định để đảm bảo quá trình học tập không bị gián đoạn.',
          'Kiến thức nền tảng về HTML và CSS sẽ giúp bạn dễ dàng tiếp cận các khái niệm mới trong khóa học này.',
          'Trước khi bắt đầu, hãy đảm bảo bạn đã cài đặt Node.js và npm để có thể chạy các ví dụ thực hành và cài đặt các thư viện cần thiết.',
          'Tinh thần học hỏi, chủ động tìm hiểu và không ngại thử nghiệm là yếu tố quan trọng giúp bạn tiến bộ nhanh hơn.',
          'Khả năng đọc hiểu tài liệu tiếng Anh sẽ giúp bạn tiếp cận nhiều nguồn kiến thức và giải quyết các vấn đề kỹ thuật hiệu quả hơn.',
          'Bạn nên có tài khoản Github để lưu trữ, quản lý mã nguồn và chia sẻ các dự án thực hành với cộng đồng.'
        ]}
      />
      {/* description */}
      <h4 className='font-bold bg-slate-800 text-white p-2 rounded-r-3xl max-w-md text-center flex mt-6'>
        <FaSquarePollHorizontal size={20} className='mt-1' />
        &nbsp;Mô tả chi tiết về khóa học ?
      </h4>
      <div className='description-container text-sm max-w-7xl text-left ml-12 mt-6 font-medium text-gray-700'>
        ... cái này do người dùng nhập edittext Lorem ipsum, dolor sit amet consectetur adipisicing elit. Inventore
        nulla veniam quos animi exercitationem soluta tenetur, repellat ad. Quod maiores sunt praesentium reiciendis
        necessitatibus commodi totam quidem perferendis unde illo. Lorem ipsum dolor sit amet consectetur adipisicing
        elit. Illo obcaecati minima aliquid aperiam doloremque quidem ab minus quasi fugiat debitis incidunt, cum
        aspernatur, facere voluptas nesciunt maxime quaerat repudiandae! Odio. Perferendis, rem, asperiores inventore
        commodi, aliquam vel natus harum quae minima consequuntur ad sunt! Eius commodi modi enim atque sunt error cum
        nemo mollitia nihil. Quasi quo porro hic sapiente! Recusandae asperiores saepe officia aut ipsa, perferendis
        itaque aspernatur doloremque porro voluptate repellendus totam dignissimos in error natus incidunt ab deleniti
        labore delectus optio est vitae iusto. Maiores, sint ut? Quod labore, unde est eum dolor quia perspiciatis,
        culpa accusamus atque sint id odio. Doloremque similique tempore id nihil obcaecati sit inventore. Inventore
        necessitatibus qui ex aperiam hic voluptatibus sequi? Velit temporibus enim, laboriosam, deleniti consequatur
        doloremque dignissimos ad doloribus animi ipsa nesciunt eius soluta quis vitae. Similique eveniet, qui ad
        deleniti nulla voluptates illo numquam totam vel possimus nisi?
      </div>
      {/* Giới thiệu giảng viên hướng dẫn */}
      <hr className='m-3' />
      <h3 className='mt-6 ml-12 mb-4 text-lg font-semibold mr-2 flex items-center'>
        <FaUserGraduate />
        &nbsp;Giới thiệu giảng viên
      </h3>
      <TeacherInfo />
    </div>
  )
}

export default CourseContent
