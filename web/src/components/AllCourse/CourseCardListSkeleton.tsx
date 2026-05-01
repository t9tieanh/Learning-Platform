interface CourseCardListSkeletonProps {
  layout?: 'list' | 'grid'
}

const CourseCardListSkeleton = ({ layout = 'list' }: CourseCardListSkeletonProps) => {
  const isGrid = layout === 'grid'

  if (isGrid) {
    return (
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        <div className='aspect-[4/3] w-full bg-slate-200/80 animate-pulse' />
        <div className='p-5 space-y-4'>
          <div className='space-y-2'>
            <div className='h-5 w-4/5 rounded-md bg-slate-200/80 animate-pulse' />
            <div className='h-4 w-3/5 rounded-md bg-slate-200/80 animate-pulse' />
          </div>
          <div className='flex items-center gap-3'>
            <div className='h-8 w-8 rounded-full bg-slate-200/80 animate-pulse' />
            <div className='space-y-1'>
              <div className='h-3 w-24 rounded-md bg-slate-200/80 animate-pulse' />
              <div className='h-3 w-16 rounded-md bg-slate-200/80 animate-pulse' />
            </div>
          </div>
          <div className='h-3 w-40 rounded-md bg-slate-200/80 animate-pulse' />
          <div className='h-5 w-28 rounded-md bg-slate-200/80 animate-pulse' />
        </div>
      </div>
    )
  }

  return (
    <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
      <div className='flex min-h-[200px] flex-row items-stretch'>
        <div className='w-[19rem] flex-shrink-0 bg-slate-200/80 animate-pulse' />

        <div className='flex flex-1 flex-col justify-between p-6'>
          <div className='flex-1 space-y-3'>
            <div className='h-4 w-32 bg-slate-200/80 rounded-md animate-pulse' />
            <div className='space-y-2'>
              <div className='h-5 w-full bg-slate-200/80 rounded-md animate-pulse' />
              <div className='h-5 w-2/3 bg-slate-200/80 rounded-md animate-pulse' />
            </div>

            <div className='space-y-1'>
              <div className='h-3 w-full bg-slate-200/80 rounded-md animate-pulse' />
              <div className='h-3 w-3/4 bg-slate-200/80 rounded-md animate-pulse' />
            </div>

            <div className='flex items-center gap-3'>
              <div className='h-6 w-6 rounded-full bg-slate-200/80 animate-pulse' />
              <div className='h-3 w-24 bg-slate-200/80 rounded-md animate-pulse' />
              <div className='h-3 w-16 bg-slate-200/80 rounded-md animate-pulse' />
              <div className='h-3 w-16 bg-slate-200/80 rounded-md animate-pulse' />
            </div>
          </div>
          <div className='mt-4 h-px w-full bg-slate-100' />
          <div className='mt-4 flex items-center justify-between'>
            <div className='space-y-2'>
              <div className='h-6 w-24 bg-slate-200/80 rounded-md animate-pulse' />
              <div className='h-4 w-20 bg-slate-200/80 rounded-md animate-pulse' />
            </div>
            <div className='h-10 w-28 bg-slate-200/80 rounded-full animate-pulse' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseCardListSkeleton
