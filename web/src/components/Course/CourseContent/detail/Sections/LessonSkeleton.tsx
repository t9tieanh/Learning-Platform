const LESSON_SKELETON_COUNT = 2

const LessonSkeleton = () => {
  return (
    <div className='space-y-2 md:space-y-3'>
      {Array.from({ length: LESSON_SKELETON_COUNT }).map((_, idx) => (
        <div
          key={idx}
          className='flex animate-pulse items-center justify-between gap-2 rounded-md bg-gray-50 p-2 md:gap-3 md:p-3'
        >
          <div className='flex min-w-0 flex-1 items-center gap-2 md:gap-3'>
            <div className='h-5 w-5 shrink-0 rounded-full bg-gray-200 md:h-6 md:w-6' />
            <div className='h-3.5 min-w-0 flex-1 rounded-md bg-gray-200 sm:max-w-[55%] md:max-w-[65%]' />
          </div>
          <div className='flex shrink-0 items-center gap-1.5 md:gap-2'>
            <div className='hidden h-5 w-16 rounded-full bg-gray-200 sm:block' />
            <div className='h-3 w-10 rounded bg-gray-200 md:w-12' />
          </div>
        </div>
      ))}
    </div>
  )
}

export default LessonSkeleton
