import React from 'react'
import { Progress } from '@/components/ui/progress'

const IntroVideoPreviewProgress: React.FC<{ progress: number; className?: string }> = ({ progress, className }) => {
  return (
    <div className={`w-full ${className ?? ''}`}>
      <div className='flex items-center justify-between mb-1.5'>
        <span className='text-[10.5px] font-medium text-gray-500'>Đang trong quá trình tải lên</span>
        <span className='text-[10.5px] font-bold text-blue-600'>{Math.round(progress)}%</span>
      </div>
      <Progress value={Math.max(0, Math.min(100, Math.round(progress)))} className='h-1.5' />
    </div>
  )
}

export default IntroVideoPreviewProgress
