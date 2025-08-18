import React from 'react'
import { CheckCircle2 } from 'lucide-react'

interface RequirementsProps {
  requirements: string[]
}

const Requirements: React.FC<RequirementsProps> = ({ requirements }) => {
  return (
    <div className='space-y-4'>
      {requirements.map((requirement, index) => (
        <div
          key={index}
          className='flex items-start gap-4 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors duration-200'
        >
          <div className='flex-shrink-0 mt-1'>
            <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center'>
              {React.createElement(CheckCircle2, { className: 'w-4 h-4 text-primary' })}
            </div>
          </div>
          <p className='text-muted-foreground leading-relaxed text-base'>{requirement}</p>
        </div>
      ))}

      <div className='mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg'>
        <div className='flex items-center gap-2 mb-2'>
          <div className='w-2 h-2 bg-primary rounded-full animate-pulse' />
          <span className='text-sm font-medium text-primary'>Lưu ý quan trọng</span>
        </div>
        <p className='text-sm text-muted-foreground'>
          Tất cả các yêu cầu trên đều là khuyến nghị để bạn có trải nghiệm học tập tốt nhất. Nếu bạn chưa đáp ứng đủ,
          đừng lo lắng - chúng tôi sẽ hướng dẫn bạn từng bước!
        </p>
      </div>
    </div>
  )
}

export default Requirements
