const CourseCardSkeleton = () => {
  return (
    <div className='bg-white rounded-2xl shadow-sm p-0 overflow-hidden'>
      {/* Image skeleton */}
      <div className='h-48 w-full bg-gray-200 rounded-none animate-pulse' />

      {/* Content */}
      <div className='p-4 pt-1 space-y-3'>
        {/* Title */}
        <div className='h-6 w-3/4 bg-gray-200 rounded-md animate-pulse' />

        {/* Price info */}
        <div className='flex gap-2'>
          <div className='h-4 w-16 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-4 w-16 bg-gray-200 rounded-md animate-pulse' />
        </div>

        {/* Footer - instructor and button */}
        <div className='flex justify-between items-center gap-2 mt-4'>
          <div className='flex items-center gap-2'>
            {/* Avatar */}
            <div className='h-10 w-10 rounded-full bg-gray-200 animate-pulse' />
            {/* Name */}
            <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
          </div>
          {/* Button */}
          <div className='h-9 w-24 rounded-3xl bg-gray-200 animate-pulse' />
        </div>
      </div>
    </div>
  )
}

export default CourseCardSkeleton
