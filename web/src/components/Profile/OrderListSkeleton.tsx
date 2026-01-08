const OrderListSkeleton = () => {
  return (
    <div className='cart-section pb-5 px-5 bg-white rounded-lg'>
      <div className='total-cart-item'>
        <div className='h-5 w-48 bg-gray-200 rounded-md animate-pulse mb-3' />
        <hr />
      </div>
      <div className='cart-item flex flex-col p-4 gap-4 min-h-[750px]'>
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className='bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3'>
            {/* Order header - Order ID and date */}
            <div className='flex justify-between items-start pb-3 border-b'>
              <div className='space-y-2'>
                <div className='h-4 w-32 bg-gray-200 rounded-md animate-pulse' />
                <div className='h-3 w-40 bg-gray-200 rounded-md animate-pulse' />
              </div>
              <div className='h-6 w-20 bg-gray-200 rounded-full animate-pulse' />
            </div>

            {/* Order items - 2-3 courses */}
            <div className='space-y-2'>
              {[...Array(2)].map((_, itemIdx) => (
                <div key={itemIdx} className='flex items-center gap-3'>
                  <div className='h-12 w-12 bg-gray-200 rounded-md animate-pulse flex-shrink-0' />
                  <div className='flex-1 space-y-1'>
                    <div className='h-3 w-40 bg-gray-200 rounded-md animate-pulse' />
                    <div className='h-3 w-20 bg-gray-200 rounded-md animate-pulse' />
                  </div>
                </div>
              ))}
            </div>

            {/* Total price */}
            <div className='flex justify-between items-center pt-3 border-t'>
              <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
              <div className='h-5 w-32 bg-gray-200 rounded-md animate-pulse' />
            </div>

            {/* Action button */}
            <div className='flex gap-2 pt-2'>
              <div className='h-9 w-28 bg-gray-200 rounded-md animate-pulse' />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default OrderListSkeleton
