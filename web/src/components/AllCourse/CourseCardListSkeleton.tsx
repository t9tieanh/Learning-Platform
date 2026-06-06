import { Skeleton } from '@/components/ui/skeleton'

interface CourseCardListSkeletonProps {
  layout?: 'list' | 'grid'
}

const CourseCardListSkeleton = ({ layout = 'list' }: CourseCardListSkeletonProps) => {
  const isGrid = layout === 'grid'

  if (isGrid) {
    return (
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'>
        <div className='flex flex-col'>
          <div className='relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-blue-50'>
            <Skeleton className='h-full w-full rounded-none' />
          </div>

          <div className='flex min-w-0 flex-1 flex-col justify-between gap-4 p-5'>
            <div className='space-y-2'>
              <div className='space-y-1'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
              </div>
              <Skeleton className='h-3 w-full' />
              <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1'>
                <Skeleton className='h-6 w-6 shrink-0 rounded-full' />
                <Skeleton className='h-3 w-20' />
                <Skeleton className='h-3 w-8' />
                <Skeleton className='h-5 w-16 rounded-full' />
              </div>
            </div>

            <div className='h-px w-full bg-slate-100' />

            <div className='flex items-center justify-between pt-1'>
              <div className='space-y-1'>
                <Skeleton className='h-5 w-24' />
                <Skeleton className='h-3 w-16' />
              </div>
              <Skeleton className='h-10 min-w-[118px] rounded-full' />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'>
      <div className='flex flex-col md:h-[240px] md:flex-row md:items-stretch'>
        <div className='relative h-48 w-full shrink-0 overflow-hidden bg-blue-50 md:h-full md:w-[20rem]'>
          <Skeleton className='h-full w-full rounded-none' />
        </div>

        <div className='flex min-w-0 flex-1 flex-col justify-between gap-3 p-5 md:p-6'>
          <div className='space-y-2'>
            <div className='space-y-1'>
              <Skeleton className='h-4 w-full md:h-5' />
              <Skeleton className='h-4 w-2/3' />
            </div>
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-4/5' />
            <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1'>
              <Skeleton className='h-6 w-6 shrink-0 rounded-full' />
              <Skeleton className='h-3 w-20' />
              <Skeleton className='h-3 w-8' />
              <Skeleton className='h-5 w-16 rounded-full' />
            </div>
          </div>

          <div className='h-px w-full bg-slate-100' />

          <div className='flex items-center justify-between'>
            <div className='space-y-1'>
              <Skeleton className='h-5 w-24 md:h-6' />
              <Skeleton className='h-3 w-16' />
            </div>
            <Skeleton className='h-10 min-w-[118px] rounded-full' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseCardListSkeleton
