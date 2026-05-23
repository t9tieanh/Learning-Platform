import CourseSectionsSkeleton from '@/components/Course/CourseContent/detail/Sections/CourseSectionsSkeleton'

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
      <div className='grid grid-cols-1 gap-6 bg-white px-4 py-6 md:grid-cols-3 md:p-8'>
        {/* Left Column - Course Content */}
        <div className='lg:col-span-2'>
          {/* Nội dung khóa học — 2 chapter cards, mobile-friendly */}
          <div className='mb-10'>
            <div className='mb-4 h-8 max-w-[min(100%,20rem)] animate-pulse rounded-r-3xl bg-gray-200 pl-4 md:pl-12' />
            <CourseSectionsSkeleton />
          </div>

          {/* Requirements Section */}
          <div className='mb-10'>
            <div className='mb-4 h-8 max-w-[min(100%,12rem)] animate-pulse rounded-r-3xl bg-gray-200 pl-4 md:pl-12' />
            <div className='ml-0 space-y-3 md:ml-20'>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className='h-5 w-full max-w-md animate-pulse rounded-md bg-gray-200' />
              ))}
            </div>
          </div>

          {/* Description Section */}
          <div>
            <div className='mb-4 h-8 max-w-[min(100%,10rem)] animate-pulse rounded-r-3xl bg-gray-200 pl-4 md:pl-12' />
            <div className='ml-0 space-y-3 md:ml-20'>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='h-5 w-full animate-pulse rounded-md bg-gray-200' />
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
