import { Skeleton } from '@/components/ui/skeleton'

export const QASectionSkeleton = () => {
  return (
    <div className='py-6 space-y-6'>
      {/* Comment Input Skeleton */}
      <div className='bg-card rounded-lg border border-border p-6 space-y-4'>
        <Skeleton className='h-6 w-24 bg-gray-200 animate-pulse' />
        <Skeleton className='h-24 w-full bg-gray-200 animate-pulse' />
        <div className='flex justify-end'>
          <Skeleton className='h-10 w-20 bg-gray-200 animate-pulse' />
        </div>
      </div>

      {/* Comments List Skeleton */}
      <div className='space-y-4 max-h-[600px] overflow-y-auto pr-2'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='bg-card rounded-lg border border-border p-6 space-y-4'>
            <div className='flex gap-4'>
              <Skeleton className='h-10 w-10 rounded-full flex-shrink-0 bg-gray-200 animate-pulse' />
              <div className='flex-1 space-y-3 w-full'>
                <div className='flex items-center gap-2'>
                  <Skeleton className='h-4 w-32 bg-gray-200 animate-pulse' />
                  <Skeleton className='h-4 w-24 bg-gray-200 animate-pulse' />
                </div>
                <Skeleton className='h-4 w-full bg-gray-200 animate-pulse' />
                <Skeleton className='h-4 w-5/6 bg-gray-200 animate-pulse' />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
