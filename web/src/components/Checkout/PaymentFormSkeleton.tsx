const PaymentFormSkeleton = () => {
  return (
    <div className='space-y-6'>
      {/* Payment Methods Title */}
      <div className='h-8 w-40 bg-gray-200 rounded-md animate-pulse' />

      {/* Payment method cards */}
      <div className='space-y-4'>
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className='border border-gray-200 rounded-lg p-4 space-y-3'>
            {/* Logo placeholder */}
            <div className='h-10 w-24 bg-gray-200 rounded-md animate-pulse' />

            {/* Method name */}
            <div className='h-5 w-32 bg-gray-200 rounded-md animate-pulse' />

            {/* Email input skeleton */}
            <div className='space-y-2'>
              <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
              <div className='h-10 w-full bg-gray-200 rounded-md animate-pulse' />
            </div>

            {/* Button */}
            <div className='h-10 w-full bg-gray-200 rounded-md animate-pulse' />
          </div>
        ))}
      </div>

      {/* Note section */}
      <div className='space-y-2'>
        <div className='h-5 w-32 bg-gray-200 rounded-md animate-pulse' />
        <div className='space-y-2'>
          <div className='h-4 w-full bg-gray-200 rounded-md animate-pulse' />
          <div className='h-4 w-full bg-gray-200 rounded-md animate-pulse' />
          <div className='h-4 w-3/4 bg-gray-200 rounded-md animate-pulse' />
        </div>
      </div>
    </div>
  )
}

export default PaymentFormSkeleton
