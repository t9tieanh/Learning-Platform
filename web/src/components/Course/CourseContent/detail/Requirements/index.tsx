import React from 'react'
import { CheckCircle2 } from 'lucide-react'

interface RequirementsProps {
  requirements: string[]
}

const Requirements: React.FC<RequirementsProps> = ({ requirements }) => {
  return (
    <ul className='space-y-2 max-w-3xl ml-20 my-3'>
      {requirements &&
        requirements?.map((title, index) => (
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
  )
}

export default Requirements
