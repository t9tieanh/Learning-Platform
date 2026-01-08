import { Skeleton } from '@/components/ui/skeleton'

export const CourseSidebarSkeleton = () => {
  return (
    <div className='w-96 border-l border-border p-4 space-y-4 overflow-y-auto'>
      {/* Section Header Skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-6 w-3/4 bg-gray-200 animate-pulse' />
        <Skeleton className='h-4 w-1/3 bg-gray-200 animate-pulse' />
      </div>

      {/* Section Items Skeleton */}
      {Array.from({ length: 3 }).map((_, sectionIdx) => (
        <div key={sectionIdx} className='space-y-2 pt-4 border-t'>
          <Skeleton className='h-5 w-2/3 bg-gray-200 animate-pulse' />
          {Array.from({ length: 2 }).map((_, itemIdx) => (
            <div key={itemIdx} className='space-y-1 pl-4'>
              <Skeleton className='h-4 w-full bg-gray-200 animate-pulse' />
              <Skeleton className='h-3 w-1/3 bg-gray-200 animate-pulse' />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
