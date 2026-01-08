const CheckoutSummarySkeleton = () => {
  return (
    <div className='border-gray-300 border-1 shadow-sm rounded-xl p-4 bg-white'>
      <div className='checkout-title'>
        <div className='h-5 w-20 bg-gray-200 rounded-md animate-pulse mb-3' />
        <hr />
      </div>
      <div className='mt-3 p-1 space-y-4'>
        {/* Total price skeleton */}
        <div className='flex items-center justify-between p-2'>
          <div className='h-7 w-32 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-5 w-24 bg-gray-200 rounded-md animate-pulse' />
        </div>
        <hr />

        {/* Order detail items */}
        <div className='order-detail space-y-4'>
          {[...Array(2)].map((_, idx) => (
            <div key={idx} className='space-y-2'>
              <div className='flex items-center gap-2'>
                <div className='h-8 w-8 rounded-full bg-gray-200 animate-pulse' />
                <div className='h-4 w-40 bg-gray-200 rounded-md animate-pulse' />
              </div>
              <div className='flex justify-between items-center'>
                <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
                <div className='h-8 w-8 bg-gray-200 rounded-md animate-pulse' />
              </div>
              <hr />
            </div>
          ))}
        </div>

        {/* Buttons skeleton */}
        <div className='space-y-2'>
          <div className='h-10 w-full bg-gray-200 rounded-md animate-pulse' />
          <div className='h-10 w-full bg-gray-200 rounded-md animate-pulse' />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummarySkeleton
