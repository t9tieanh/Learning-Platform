const SKELETON_ITEM_COUNT = 2

const CourseSectionsSkeleton = () => {
  return (
    <div className='content-accordion-container ml-0 mt-6 md:ml-20'>
      <div className='w-full space-y-2.5'>
        {Array.from({ length: SKELETON_ITEM_COUNT }).map((_, i) => (
          <div
            key={i}
            className='max-w-full animate-pulse overflow-hidden rounded-lg border border-gray-300 bg-white p-3 md:p-4'
          >
            <div className='flex items-center gap-2 md:gap-4'>
              <div className='h-8 w-8 shrink-0 rounded-lg bg-gray-200 md:h-10 md:w-10' />
              <div className='min-w-0 flex-1 space-y-2'>
                <div className='h-4 w-[85%] max-w-xs rounded-md bg-gray-200 md:max-w-sm' />
                <div className='flex flex-wrap gap-2 md:gap-4'>
                  <div className='h-3 w-14 rounded bg-gray-100 md:w-16' />
                  <div className='h-3 w-12 rounded bg-gray-100 md:w-14' />
                </div>
              </div>
              <div className='hidden h-6 w-12 shrink-0 rounded-full bg-gray-200 sm:block md:w-14' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default CourseSectionsSkeleton
