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
          className='flex ml-10 gap-4 p-4 bg-primary/5 border border-primary/20 rounded-lg transition-colors duration-200'
        >
          <div className='flex-shrink-0 mt-1 '>
            <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center'>
              {React.createElement(CheckCircle2, { className: 'w-4 h-4 text-primary' })}
            </div>
          </div>
          <p className='text-slate-600 leading-relaxed text-base'>{requirement}</p>
        </div>
      ))}
    </div>
  )
}

export default Requirements
