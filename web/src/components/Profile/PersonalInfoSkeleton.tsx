const PersonalInfoSkeleton = () => {
  return (
    <div className='bg-white shadow-lg border border-gray-200 rounded-lg p-6 space-y-6'>
      {/* Avatar and basic info section */}
      <div className='flex flex-col md:flex-row items-start md:items-center gap-6 pb-6 border-b'>
        {/* Avatar skeleton */}
        <div className='h-24 w-24 bg-gray-200 rounded-full animate-pulse flex-shrink-0' />

        {/* Basic info skeleton */}
        <div className='flex-1 space-y-3 w-full'>
          <div className='h-6 w-40 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-4 w-48 bg-gray-200 rounded-md animate-pulse' />
          <div className='flex gap-2'>
            <div className='h-10 w-24 bg-gray-200 rounded-md animate-pulse' />
            <div className='h-10 w-24 bg-gray-200 rounded-md animate-pulse' />
          </div>
        </div>
      </div>

      {/* Contact info section */}
      <div className='space-y-4 pb-6 border-b'>
        <div className='h-5 w-32 bg-gray-200 rounded-md animate-pulse' />
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          {[...Array(4)].map((_, idx) => (
            <div key={idx} className='space-y-2'>
              <div className='h-4 w-24 bg-gray-200 rounded-md animate-pulse' />
              <div className='h-9 w-full bg-gray-200 rounded-md animate-pulse' />
            </div>
          ))}
        </div>
      </div>

      {/* Bio section */}
      <div className='space-y-3'>
        <div className='h-5 w-20 bg-gray-200 rounded-md animate-pulse' />
        <div className='space-y-2'>
          <div className='h-24 w-full bg-gray-200 rounded-md animate-pulse' />
        </div>
      </div>

      {/* Buttons */}
      <div className='flex gap-2 pt-4'>
        <div className='h-10 w-24 bg-gray-200 rounded-md animate-pulse' />
        <div className='h-10 w-24 bg-gray-200 rounded-md animate-pulse' />
      </div>
    </div>
  )
}

export default PersonalInfoSkeleton
