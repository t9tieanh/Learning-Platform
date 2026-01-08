const CourseLoadingSkeleton = () => {
  return (
    <div className='course-page bg-white'>
      {/* Cover Skeleton */}
      <div className='cover-container h-96 bg-gray-200 animate-pulse' />

      {/* What You Will Learn Skeleton */}
      <div className='py-12 px-6 md:px-12'>
        <div className='h-8 w-64 mb-8 rounded-lg bg-gray-200 animate-pulse' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='h-6 w-full rounded-md bg-gray-200 animate-pulse' />
          ))}
        </div>
      </div>

      {/* Course Content Skeleton */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-6 md:p-8'>
        {/* Left Column - Course Content */}
        <div className='lg:col-span-2'>
          {/* Requirements Section */}
          <div className='mb-10'>
            <div className='h-8 w-48 mb-6 rounded-lg bg-gray-200 animate-pulse' />
            <div className='space-y-3 pl-2'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='h-5 w-full rounded-md bg-gray-200 animate-pulse' />
              ))}
            </div>
          </div>

          {/* Course Content Sections */}
          <div className='mb-10'>
            <div className='h-8 w-64 mb-6 rounded-lg bg-gray-200 animate-pulse' />
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className='mb-8 pl-2'>
                <div className='h-7 w-48 mb-4 rounded-lg bg-gray-200 animate-pulse' />
                <div className='space-y-3 ml-6'>
                  {Array.from({ length: 2 }).map((_, j) => (
                    <div key={j} className='h-5 w-full rounded-md bg-gray-200 animate-pulse' />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Description Section */}
          <div className='pl-2'>
            <div className='h-8 w-40 mb-6 rounded-lg bg-gray-200 animate-pulse' />
            <div className='space-y-3'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className='h-5 w-full rounded-md bg-gray-200 animate-pulse' />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className='lg:col-span-1'>
          <div className='sticky top-24 space-y-5'>
            {/* Purchase Button Skeleton */}
            <div className='h-12 w-full rounded-lg bg-gray-200 animate-pulse' />
            {/* Course Details Box Skeleton */}
            <div className='h-48 w-full rounded-lg bg-gray-200 animate-pulse' />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CourseLoadingSkeleton
