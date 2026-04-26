import { Skeleton } from '@/components/ui/skeleton'

const ChatBubbleSkeleton = () => {
  return (
    <div className='space-y-4 p-1'>
      <div className='flex justify-start'>
        <div className='flex items-end gap-2.5'>
          <Skeleton className='h-9 w-9 rounded-2xl bg-blue-100' />
          <Skeleton className='h-14 w-[75vw] max-w-[280px] rounded-[1.6rem] rounded-bl-md border border-blue-100 bg-white' />
        </div>
      </div>

      <div className='flex justify-end'>
        <div className='flex items-end gap-2.5'>
          <Skeleton className='h-10 w-[48vw] max-w-[220px] rounded-[1.6rem] rounded-br-md bg-blue-400/25' />
          <Skeleton className='h-9 w-9 rounded-2xl bg-blue-100' />
        </div>
      </div>

      <div className='flex justify-start'>
        <div className='flex items-end gap-2.5'>
          <Skeleton className='h-9 w-9 rounded-2xl bg-blue-100' />
          <Skeleton className='h-20 w-[82vw] max-w-[320px] rounded-[1.6rem] rounded-bl-md border border-blue-100 bg-white' />
        </div>
      </div>

      <div className='flex justify-end'>
        <div className='flex items-end gap-2.5'>
          <Skeleton className='h-10 w-[34vw] max-w-[160px] rounded-[1.6rem] rounded-br-md bg-blue-400/25' />
          <Skeleton className='h-9 w-9 rounded-2xl bg-blue-100' />
        </div>
      </div>
    </div>
  )
}

export default ChatBubbleSkeleton
