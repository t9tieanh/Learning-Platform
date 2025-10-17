import React from 'react'
import { CalendarDays, Info } from 'lucide-react'

interface CourseData {
  title: string
  description?: string
  createdAt?: string | Date
}

interface CourseHeaderProps {
  courseData: CourseData
}

export const CourseHeader: React.FC<CourseHeaderProps> = ({ courseData }) => {
  return (
    <div className='space-y-3'>
      <h2 className='text-xl font-semibold mb-2'>{courseData.title}</h2>

      {courseData.createdAt && (
        <div className='flex items-center text-muted-foreground text-base mb-2'>
          <CalendarDays size={16} className='mr-2' />
          <span>
            Được tạo ngày{' '}
            {new Date(courseData.createdAt).toLocaleDateString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </span>
        </div>
      )}

      {courseData.description && (
        <div className='flex items-start text-muted-foreground text-base mb-3'>
          <Info size={18} className='mt-1 mr-2' />
          <p>{courseData.description}</p>
        </div>
      )}
    </div>
  )
}
