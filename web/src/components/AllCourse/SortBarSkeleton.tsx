import { Skeleton } from '@/components/ui/skeleton'

const SortBarSkeleton = () => {
  return (
    <div className='mb-5 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_30px_rgba(15,23,42,0.05)] lg:flex-row lg:items-center lg:justify-between'>
      <Skeleton className='h-5 w-44' />
      <div className='flex flex-wrap items-center gap-3'>
        <Skeleton className='hidden h-5 w-16 sm:block' />
        <Skeleton className='h-11 w-[180px] rounded-full' />
        <div className='flex items-center gap-1 rounded-full border border-blue-100 bg-white p-1 shadow-sm'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <Skeleton className='h-10 w-10 rounded-full' />
        </div>
      </div>
    </div>
  )
}

export default SortBarSkeleton
