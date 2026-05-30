import { Skeleton } from '@/components/ui/skeleton'

export const CourseHeroSkeleton = () => {
  return (
    <div className='relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-7 shadow-[0_10px_28px_rgba(15,23,42,0.05)]'>
      <div className='grid gap-6 lg:grid-cols-2 lg:gap-8'>
        <div className='flex flex-col space-y-5'>
          <Skeleton className='h-10 w-3/4 bg-slate-200' />

          <div className='flex flex-wrap items-center gap-3'>
            <Skeleton className='h-6 w-20 rounded-full bg-slate-200' />
            <Skeleton className='h-6 w-32 rounded-full bg-slate-200' />
            <Skeleton className='h-6 w-24 rounded-full bg-slate-200' />
          </div>

          <div className='flex gap-3 pt-3'>
            <Skeleton className='h-11 w-32 rounded-xl bg-slate-200' />
            <Skeleton className='h-11 w-32 rounded-xl bg-slate-200' />
          </div>
        </div>

        <div className='relative aspect-video overflow-hidden rounded-2xl border border-slate-200'>
          <Skeleton className='h-full w-full bg-slate-200' />
        </div>
      </div>
    </div>
  )
}
