import { Skeleton } from '@/components/ui/skeleton'

export const CourseContentSkeleton = () => {
  return (
    <div className='space-y-8'>
      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] space-y-4'>
        <Skeleton className='h-6 w-40 bg-slate-200' />
        <Skeleton className='h-16 w-full rounded-xl bg-slate-200' />
        <div className='flex gap-3'>
          <Skeleton className='h-8 w-24 rounded-md bg-slate-200' />
          <Skeleton className='h-8 w-24 rounded-md bg-slate-200' />
        </div>
      </div>

      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] space-y-4'>
        <Skeleton className='h-6 w-48 bg-slate-200' />
        <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className='flex gap-2'>
              <Skeleton className='h-5 w-5 shrink-0 rounded-full bg-slate-200' />
              <Skeleton className='h-5 w-full bg-slate-200' />
            </div>
          ))}
        </div>
      </div>

      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] space-y-4'>
        <Skeleton className='h-6 w-32 bg-slate-200' />
        <div className='space-y-2'>
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className='h-14 w-full rounded-xl bg-slate-200' />
          ))}
        </div>
      </div>

      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)] space-y-4'>
        <Skeleton className='h-6 w-40 bg-slate-200' />
        <div className='space-y-2'>
          <Skeleton className='h-4 w-full bg-slate-200' />
          <Skeleton className='h-4 w-full bg-slate-200' />
          <Skeleton className='h-4 w-3/4 bg-slate-200' />
        </div>
      </div>
    </div>
  )
}
