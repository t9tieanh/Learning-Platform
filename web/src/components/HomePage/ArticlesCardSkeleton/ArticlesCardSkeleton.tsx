const ArticlesCardSkeleton = () => {
  return (
    <div className='bg-gray-100 rounded-2xl shadow-sm overflow-hidden'>
      {/* Image skeleton */}
      <div className='h-48 w-full bg-gray-200 rounded-none animate-pulse' />

      {/* Content */}
      <div className='p-4 space-y-3'>
        {/* Title */}
        <div className='h-6 w-4/5 bg-gray-200 rounded-md animate-pulse' />

        {/* Description - 2 lines */}
        <div className='space-y-2'>
          <div className='h-4 w-full bg-gray-200 rounded-md animate-pulse' />
          <div className='h-4 w-3/4 bg-gray-200 rounded-md animate-pulse' />
        </div>
      </div>
    </div>
  )
}

export default ArticlesCardSkeleton
