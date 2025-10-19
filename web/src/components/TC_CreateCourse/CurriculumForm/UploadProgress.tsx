import { MultiUploadItem } from '@/hooks/useMultiUpload'
import { Progress as ProgressShadcn } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { CircleCheckBig } from 'lucide-react'

const UploadProgress = ({ progressLst }: { progressLst: MultiUploadItem[] }) => {
  return (
    <>
      {progressLst?.map((item) => (
        <>
          <div
            key={item.id}
            className='flex items-center space-x-3 py-4 px-4 bg-blue-50 rounded-lg border border-blue-200'
          >
            {item.progress !== 100 ? (
              <Spinner className='size-4 text-red-500' />
            ) : (
              <CircleCheckBig className='h-4 w-4 text-green-500' />
            )}
            <div className=''>
              <span className='font-medium text-sm'>{item.title || 'Bài giảng chưa có tiêu đề'}</span>
            </div>
            <div className='flex-1'>
              <span className='text-sm text-gray-600'>{item.message}</span>
              <ProgressShadcn className='progressIndicator' value={item.progress} />
            </div>
          </div>
        </>
      ))}
    </>
  )
}

export default UploadProgress
