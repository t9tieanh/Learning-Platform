import React from 'react'
import { CheckCircle2 } from 'lucide-react'

const WhatYouWillLearn = () => {
  const learningPoints = [
    'Nắm vững các thao tác cơ bản',
    'Biết cách cắt ghép, chỉnh sửa, thêm hiệu ứng',
    'Thành thạo các kỹ thuật xử lý màu sắc',
    'Tự tin xây dựng quy trình chỉnh sửa video hoàn chỉnh'
  ]

  return (
    <section className='my-8 bg-white'>
      <div className='shrink-0'>
        <h4 className='font-bold max-w-80 bg-blue-500 text-white p-2 rounded-r-3xl pl-12'>Kiến thức đạt được</h4>
      </div>

      <ul className='space-y-4 max-w-3xl ml-14 my-8'>
        {learningPoints.map((title, index) => (
          <li key={index} className='flex items-center space-x-4 group'>
            <div className='flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300'>
              <CheckCircle2 size={22} strokeWidth={2.2} />
            </div>
            <span className='text-base font-medium text-foreground group-hover:text-primary transition-colors duration-300'>
              {title}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}

export default WhatYouWillLearn
