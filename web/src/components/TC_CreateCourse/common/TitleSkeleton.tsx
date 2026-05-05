import { Skeleton } from '@/components/ui/skeleton'

const TitleSkeleton = () => {
  return (
    <div className='rounded-xl border border-gray-200 bg-gradient-to-br from-slate-50 to-gray-100/90 shadow-sm p-5 md:p-6 space-y-3'>
      <div className='flex items-center gap-2.5'>
        <Skeleton className='h-8 w-8 rounded-lg shrink-0' />
        <Skeleton className='h-7 w-56 max-w-[min(100%,18rem)]' />
      </div>
      <Skeleton className='h-3.5 w-full max-w-2xl' />
      <Skeleton className='h-3.5 w-4/5 max-w-xl' />
    </div>
  )
}

export default TitleSkeleton
