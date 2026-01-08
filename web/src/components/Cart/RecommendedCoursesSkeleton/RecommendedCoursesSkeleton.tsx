const RecommendedCoursesSkeleton = () => {
  return (
    <div className='recommended-courses'>
      <div className='total-cart-item'>
        <div className='h-5 w-64 bg-gray-200 rounded-md animate-pulse mb-3' />
        <hr className='mb-4' />
        <div className='my-2'>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4 sm:gap-6'>
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className='bg-white rounded-2xl shadow-sm overflow-hidden'>
                {/* Image skeleton */}
                <div className='h-48 w-full bg-gray-200 rounded-none animate-pulse' />

                {/* Content */}
                <div className='p-4 space-y-3'>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecommendedCoursesSkeleton
