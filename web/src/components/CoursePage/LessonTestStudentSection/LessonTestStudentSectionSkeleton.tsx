import { Skeleton } from '@/components/ui/skeleton'

function QuestionCardSkeleton() {
  return (
    <div className='rounded-xl border border-gray-100 overflow-hidden shadow-sm'>
      <div className='px-4 py-3 flex gap-3 items-start border-b border-gray-100 bg-gray-50/60'>
        <Skeleton className='h-7 w-10 rounded-lg shrink-0' />
        <div className='flex-1 space-y-2 pt-0.5'>
          <Skeleton className='h-3.5 w-full max-w-md' />
          <Skeleton className='h-3.5 w-4/5 max-w-sm' />
        </div>
      </div>
      <div className='p-4 space-y-3'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex items-center gap-3'>
            <Skeleton className='h-4 w-4 rounded-full shrink-0' />
            <Skeleton className='h-3.5 flex-1 max-w-xs' style={{ maxWidth: `${220 + i * 24}px` }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function ChunkGroupSkeleton({ questionCount = 2 }: { questionCount?: number }) {
  return (
    <section className='space-y-4'>
      <Skeleton className='h-14 w-full rounded-xl' />
      <div className='space-y-4 border-l-2 border-gray-100 pl-3 md:pl-4 ml-1'>
        {Array.from({ length: questionCount }).map((_, i) => (
          <QuestionCardSkeleton key={i} />
        ))}
      </div>
    </section>
  )
}

export function LessonTestStudentSectionSkeleton() {
  return (
    <div className='relative group animate-in fade-in duration-300'>
      <div className='absolute -inset-0.5 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-2xl blur opacity-20' />
      <div className='relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-visible'>
        <div className='p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-6 lg:gap-5 lg:items-start'>
          <div className='min-w-0 space-y-6 md:space-y-8'>
            <div className='flex gap-2 overflow-x-auto pb-1 lg:hidden'>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className='h-8 w-8 rounded-lg shrink-0' />
              ))}
            </div>

            <div className='border-b border-gray-100 pb-4 space-y-2'>
              <Skeleton className='h-4 w-56 max-w-full' />
              <Skeleton className='h-3 w-32' />
            </div>

            <div className='space-y-8 md:space-y-10'>
              <ChunkGroupSkeleton questionCount={2} />
              <ChunkGroupSkeleton questionCount={1} />
            </div>

            <div className='flex justify-end pt-2 border-t border-gray-100'>
              <Skeleton className='h-9 w-28 rounded-lg' />
            </div>
          </div>

          <div className='hidden lg:block space-y-3'>
            <Skeleton className='h-3 w-24' />
            <div className='grid grid-cols-4 gap-2'>
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className='h-9 w-full rounded-lg' />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LessonTestSectionTabsSkeleton() {
  return (
    <div className='flex rounded-xl bg-blue-50/50 p-1 w-full sm:w-fit gap-1 border border-blue-100/50'>
      <Skeleton className='h-9 w-24 rounded-lg' />
      <Skeleton className='h-9 w-24 rounded-lg' />
    </div>
  )
}
