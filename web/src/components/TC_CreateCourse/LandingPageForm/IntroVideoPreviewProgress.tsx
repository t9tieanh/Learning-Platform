import React from 'react'
import { Progress } from '@/components/ui/progress'

const IntroVideoPreviewProgress: React.FC<{ progress: number }> = ({ progress }) => {
  return (
    <div className='w-full mt-3'>
      <div className='flex items-center justify-between mb-1'>
        <span className='text-xs text-gray-600'>Đang trong quá trình tải lên {progress}</span>
        <span className='text-xs text-gray-600'>{Math.round(progress)}%</span>
      </div>
      <Progress value={Math.max(0, Math.min(100, Math.round(progress)))} />
    </div>
  )
}

export default IntroVideoPreviewProgress
