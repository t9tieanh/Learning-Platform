const LessonSkeleton = () => {
  return (
    <div className='space-y-3'>
      {[...Array(3)].map((_, idx) => (
        <div key={idx} className='flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50 animate-pulse'>
          <div className='flex items-center gap-3 flex-1'>
            {/* Icon skeleton */}
            <div className='w-6 h-6 bg-gray-200 rounded-full' />
            {/* Title skeleton */}
            <div className='h-4 w-40 bg-gray-200 rounded-md' />
          </div>
          <div className='flex items-center gap-2'>
            {/* Badge skeleton */}
            <div className='h-6 w-20 bg-gray-200 rounded-full' />
            {/* Duration skeleton */}
            <div className='h-4 w-12 bg-gray-200 rounded-md' />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LessonSkeleton
