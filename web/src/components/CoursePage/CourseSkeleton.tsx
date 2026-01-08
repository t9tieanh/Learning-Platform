import { Skeleton } from '@/components/ui/skeleton'

export const CourseSkeleton = () => {
  return (
    <div className='w-full space-y-4'>
      {/* Video Player Skeleton */}
      <div className='w-full aspect-video bg-gray-200 rounded-lg animate-pulse' />

      {/* Title Skeleton */}
      <div className='space-y-2'>
        <Skeleton className='h-8 w-3/4 bg-gray-200 animate-pulse' />
        <Skeleton className='h-4 w-1/2 bg-gray-200 animate-pulse' />
      </div>

      {/* Description Skeleton */}
      <div className='space-y-2 mt-6'>
        <Skeleton className='h-4 w-full bg-gray-200 animate-pulse' />
        <Skeleton className='h-4 w-full bg-gray-200 animate-pulse' />
        <Skeleton className='h-4 w-2/3 bg-gray-200 animate-pulse' />
      </div>
    </div>
  )
}
