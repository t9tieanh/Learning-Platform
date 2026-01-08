const CourseListSkeleton = () => {
  return (
    <div className='cart-section pb-5 px-5 bg-white rounded-lg'>
      <div className='total-cart-item'>
        <div className='h-5 w-48 bg-gray-200 rounded-md animate-pulse mb-3' />
        <hr />
      </div>
      <div className='cart-item flex flex-col p-4 gap-4 min-h-[750px]'>
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className='bg-gray-50 border border-gray-200 rounded-lg p-4'>
            <div className='flex flex-col md:flex-row gap-4'>
              {/* Thumbnail skeleton */}
              <div className='h-40 w-56 bg-gray-200 rounded-lg animate-pulse flex-shrink-0' />

              {/* Content skeleton */}
              <div className='flex-1 space-y-3'>
                {/* Title */}
                <div className='h-5 w-3/4 bg-gray-200 rounded-md animate-pulse' />

                {/* Description */}
                <div className='space-y-2'>
                  <div className='h-4 w-full bg-gray-200 rounded-md animate-pulse' />
                  <div className='h-4 w-3/4 bg-gray-200 rounded-md animate-pulse' />
                </div>

                {/* Progress and more info */}
                <div className='space-y-2 pt-2'>
                  <div className='h-4 w-32 bg-gray-200 rounded-md animate-pulse' />
                  <div className='h-3 w-full bg-gray-200 rounded-full animate-pulse' />
                </div>

                {/* Buttons */}
                <div className='flex gap-2 pt-4'>
                  <div className='h-9 w-28 bg-gray-200 rounded-md animate-pulse' />
                  <div className='h-9 w-28 bg-gray-200 rounded-md animate-pulse' />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseListSkeleton
