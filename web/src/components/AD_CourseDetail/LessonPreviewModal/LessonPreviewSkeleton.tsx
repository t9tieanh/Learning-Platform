import { Skeleton } from '@/components/ui/skeleton'

/** Loading placeholder for admin lesson preview modal. */
export function LessonPreviewSkeleton() {
  return (
    <div className='flex min-h-0 flex-1 flex-col bg-slate-50/40'>
      <div className='shrink-0 border-b border-slate-100 bg-white px-6 py-4 sm:px-8'>
        <Skeleton className='h-11 w-full rounded-xl' />
      </div>

      <div className='flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8 sm:py-7'>
        <div className='rounded-xl border border-slate-100 bg-white p-5 sm:p-6'>
          <Skeleton className='h-6 w-3/4 max-w-md' />
          <div className='mt-3 flex gap-2'>
            <Skeleton className='h-6 w-16 rounded-full' />
            <Skeleton className='h-6 w-20 rounded-full' />
          </div>
        </div>

        <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
          <Skeleton className='h-[72px] rounded-xl' />
          <Skeleton className='h-[72px] rounded-xl' />
          <Skeleton className='h-[72px] rounded-xl sm:col-span-2 lg:col-span-1' />
        </div>

        <div className='rounded-xl border border-slate-100 bg-white p-5 sm:p-6'>
          <Skeleton className='mb-3 h-5 w-32' />
          <Skeleton className='mb-2 h-4 w-full' />
          <Skeleton className='mb-2 h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />
        </div>

        <Skeleton className='aspect-video w-full rounded-xl' />
      </div>
    </div>
  )
}
