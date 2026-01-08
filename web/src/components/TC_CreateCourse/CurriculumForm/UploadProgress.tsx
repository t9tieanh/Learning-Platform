import { MultiUploadItem } from '@/hooks/useMultiUpload'
import { Progress as ProgressShadcn } from '@/components/ui/progress'
import { Spinner } from '@/components/ui/spinner'
import { CheckCircle2 } from 'lucide-react'
import { Item, ItemMedia, ItemContent, ItemTitle, ItemDescription } from '@/components/ui/item'

const UploadProgress = ({ progressLst }: { progressLst: MultiUploadItem[] }) => {
  return (
    <>
      {progressLst && progressLst.length > 0 ? (
        progressLst.map((item) => (
          <Item key={item.id} variant='outline' size='sm' className='shadow-sm text-sm'>
            <ItemMedia variant='icon' className='w-8 bg-white border-none'>
              {item.progress !== 100 ? (
                <Spinner className='size-4 text-red-500' />
              ) : (
                <CheckCircle2 className='h-5 w-5 text-green-500' />
              )}
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{item.title || 'Bài giảng chưa có tiêu đề'}</ItemTitle>
              <ItemDescription>{item.message}</ItemDescription>
              <ProgressShadcn className='progressIndicator mt-1' value={item.progress} />
            </ItemContent>
          </Item>
        ))
      ) : (
        <div className='text-center text-sm text-gray-500'>Không có tiến độ tải lên nào.</div>
      )}
    </>
  )
}

export default UploadProgress
