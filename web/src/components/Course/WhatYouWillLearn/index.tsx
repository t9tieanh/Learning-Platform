import './style.scss'
import { FaLightbulb, FaLocationArrow, FaQuestionCircle } from 'react-icons/fa'
import Button from '@/components/common/Button'

const LearningText = ({ content }: { content: string }) => {
  return (
    <>
      <div className='text-center text-white flex gap-3'>
        <FaLightbulb size={30} />
        <h1 className='text-left font-medium mt-2 text-sm mb-1'>{content}</h1>
      </div>
    </>
  )
}

const WhatYouWillLearn = () => {
  const learnings = [
    {
      content:
        'Nắm vững các thao tác cơ bản trong Adobe Premiere Pro, từ việc tạo dự án mới đến quản lý timeline và các công cụ chỉnh sửa.',
    },
    {
      content:
        'Biết cách cắt ghép, chỉnh sửa, thêm hiệu ứng chuyển cảnh, chèn chữ và âm thanh để tạo ra những video chất lượng chuyên nghiệp.',
    },
    {
      content:
        'Thành thạo các kỹ thuật xử lý màu sắc, xuất video với định dạng phù hợp và tối ưu hóa chất lượng cho từng nền tảng.',
    },
    {
      content:
        'Tự tin xây dựng quy trình chỉnh sửa video hoàn chỉnh, áp dụng các mẹo và kỹ thuật giúp sản phẩm cuối cùng hấp dẫn hơn.',
    },
  ]

  return (
    <div className='what-you-will-learn-container min-h-24 bg-blue-600 pt-5 pb-12'>
      <h4 className='font-bold bg-white text-slate-800 p-2 rounded-r-3xl max-w-md text-center flex'>
        <FaQuestionCircle size={20} className='mt-1' />
        &nbsp;Bạn sẽ học được gì từ khóa học này ?
      </h4>
      <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mt-6 mx-auto max-w-7xl px-4'>
        {learnings.map((learning, index) => (
          <LearningText key={index} content={learning.content} />
        ))}
      </div>
      <div className='text-right text-sm text-black text-white mt-4 px-3'>
        <Button
          label='Xem thêm'
          icon={<FaLocationArrow />}
          isLoader={true}
          onClick={() => console.log('Xem thêm')}
          className='group bg-white text-blue-600 hover:bg-gray-200 relative'
          variant='outline'
        />
        {/* <FaLocationArrow /> Xem thêm
        </Button> */}
      </div>
    </div>
  )
}

export default WhatYouWillLearn
