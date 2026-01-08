import { Skeleton } from '@/components/ui/skeleton'

export const TabNavigationSkeleton = () => {
  return (
    <div className='w-full space-y-4'>
      {/* Tab Headers Skeleton */}
      <div className='flex gap-4 border-b'>
        <Skeleton className='h-10 w-24 bg-gray-200 animate-pulse' />
        <Skeleton className='h-10 w-24 bg-gray-200 animate-pulse' />
        <Skeleton className='h-10 w-24 bg-gray-200 animate-pulse' />
      </div>

      {/* Tab Content Skeleton */}
      <div className='space-y-3'>
        <Skeleton className='h-4 w-full bg-gray-200 animate-pulse' />
        <Skeleton className='h-4 w-full bg-gray-200 animate-pulse' />
        <Skeleton className='h-4 w-3/4 bg-gray-200 animate-pulse' />
        <Skeleton className='h-4 w-full bg-gray-200 animate-pulse' />
        <Skeleton className='h-4 w-2/3 bg-gray-200 animate-pulse' />
      </div>
    </div>
  )
}
