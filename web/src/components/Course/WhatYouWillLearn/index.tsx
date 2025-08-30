import { FaLightbulb } from 'react-icons/fa'
import { Card, CardContent } from '@/components/ui/card'

const WhatYouWillLearn = () => {
  const learningPoints = [
    {
      title: 'Nắm vững các thao tác cơ bản',
      description: 'Từ việc tạo dự án mới đến quản lý timeline và các công cụ chỉnh sửa trong Adobe Premiere Pro.'
    },
    {
      title: 'Biết cách cắt ghép, chỉnh sửa, thêm hiệu ứng',
      description: 'Chuyên cảnh, chèn chữ và âm thanh để tạo ra những video chất lượng chuyên nghiệp.'
    },
    {
      title: 'Thành thạo các kỹ thuật xử lý màu sắc',
      description: 'Xuất video với định dạng phù hợp và tối ưu hóa chất lượng cho từng nền tảng.'
    },
    {
      title: 'Tự tin xây dựng quy trình chỉnh sửa video hoàn chỉnh',
      description: 'Áp dụng các mẹo và kỹ thuật giúp sản phẩm cuối cùng hấp dẫn hơn.'
    }
  ]

  return (
    <section className='py-12 pr-4 bg-gradient-subtle'>
      <h4 className='mb-6 font-bold bg-primary text-white p-2 rounded-r-3xl max-w-md text-center flex'>
        <FaLightbulb className='mt-1 mr-1' />
        Bạn sẽ học được gì từ khóa học này ?
      </h4>
      <div className='max-w-6xl mx-auto'>
        <div className='grid md:grid-cols-2 gap-8'>
          {learningPoints.map((point, index) => (
            <Card
              key={index}
              className='group relative shadow-md overflow-hidden border-0 shadow-soft hover:shadow-elegant transition-all duration-500 hover:-translate-y-1'
            >
              <CardContent className='px-5'>
                <div className='flex items-start space-x-4'>
                  <div className='flex-1'>
                    <h3 className='text-lg flex font-semibold text-foreground mb-3 group-hover:text-primary transition-colors duration-300'>
                      <FaLightbulb className='mt-1 mr-1' />
                      {point.title}
                    </h3>
                    <p className='text-muted-foreground text-base leading-relaxed'>{point.description}</p>
                  </div>
                </div>

                {/* Decorative gradient border */}
                <div className='absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-lg' />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export default WhatYouWillLearn
