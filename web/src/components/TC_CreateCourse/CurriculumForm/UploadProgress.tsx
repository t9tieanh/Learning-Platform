import { MultiUploadItem } from '@/hooks/useMultiUpload'
import { Progress as ProgressShadcn } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle2, Upload } from 'lucide-react'
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'

const UploadProgress = ({ progressLst }: { progressLst: MultiUploadItem[] }) => {
  return (
    <>
      {progressLst && progressLst.length > 0 ? (
        progressLst.map((item) => (
          <Item
            key={item.id}
            className='bg-white border border-gray-100 shadow-sm rounded-lg p-2 group hover:border-blue-200 transition-colors'
          >
            <ItemMedia className='w-8 h-8 flex items-center justify-center bg-gray-50 rounded-full mr-3'>
              {item.progress !== 100 ? (
                <Spinner className='size-4 text-blue-600' />
              ) : (
                <CheckCircle2 className='h-5 w-5 text-green-500' />
              )}
            </ItemMedia>
            <ItemContent className='gap-1'>
              <ItemTitle className='text-sm font-medium text-gray-800'>
                {item.title || 'Bài giảng chưa có tiêu đề'}
              </ItemTitle>
              <ItemDescription className='text-xs text-gray-500'>{item.message}</ItemDescription>
              <div className='flex items-center gap-2 mt-1.5'>
                <ProgressShadcn className='h-1.5 flex-1' value={item.progress} />
                <span className='text-xs font-medium text-gray-600 w-8 text-right'>
                  {Math.round(item.progress)}%
                </span>
              </div>
            </ItemContent>
          </Item>
        ))
      ) : (
        <div className='flex flex-col items-center justify-center py-8 text-center'>
          <div className='h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3'>
            <Upload className='h-6 w-6 text-gray-300' />
          </div>
          <p className='text-sm font-medium text-gray-900'>Chưa có tệp nào</p>
          <p className='text-xs text-gray-500 mt-1'>Các tệp đang tải lên sẽ xuất hiện ở đây</p>
        </div>
      )}
    </>
  )
}

export default UploadProgress
