const CourseCardListSkeleton = () => {
  return (
    <div className='overflow-hidden group border border-border/60 bg-card/60 backdrop-blur-sm p-0'>
      <div className='flex flex-row items-stretch h-40'>
        {/* Thumbnail skeleton */}
        <div className='w-72 h-full flex-shrink-0 bg-gray-200 animate-pulse' />

        {/* Content skeleton */}
        <div className='flex-1 flex flex-col justify-between pl-5 p-3'>
          <div className='flex-1 space-y-3'>
            {/* Title skeleton - 2 lines */}
            <div className='space-y-2'>
              <div className='h-5 w-full bg-gray-200 rounded-md animate-pulse' />
              <div className='h-5 w-2/3 bg-gray-200 rounded-md animate-pulse' />
            </div>

            {/* Description skeleton - 2 lines */}
            <div className='space-y-1'>
              <div className='h-3 w-full bg-gray-200 rounded-md animate-pulse' />
              <div className='h-3 w-3/4 bg-gray-200 rounded-md animate-pulse' />
            </div>

            {/* Instructor skeleton */}
            <div className='h-3 w-20 bg-gray-200 rounded-md animate-pulse' />

            {/* Rating and reviews */}
            <div className='flex items-center gap-2'>
              <div className='h-3 w-10 bg-gray-200 rounded-md animate-pulse' />
              <div className='flex gap-0.5'>
                {[...Array(5)].map((_, i) => (
                  <div key={i} className='h-3 w-3 bg-gray-200 rounded-full animate-pulse' />
                ))}
              </div>
              <div className='h-3 w-12 bg-gray-200 rounded-md animate-pulse' />
            </div>

            {/* Duration, lectures, level skeleton */}
            <div className='flex items-center gap-3 text-xs'>
              <div className='h-3 w-16 bg-gray-200 rounded-md animate-pulse' />
              <div className='h-3 w-24 bg-gray-200 rounded-md animate-pulse' />
              <div className='h-3 w-16 bg-gray-200 rounded-md animate-pulse' />
            </div>
          </div>
        </div>

        {/* Price skeleton */}
        <div className='w-32 flex-shrink-0 pr-5 flex flex-col items-end justify-start p-3 space-y-1'>
          <div className='h-6 w-24 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
        </div>
      </div>
    </div>
  )
}

export default CourseCardListSkeleton
