const OrderSummarySkeleton = () => {
  return (
    <div className='space-y-6'>
      {/* Card title */}
      <div className='h-8 w-32 bg-gray-200 rounded-md animate-pulse' />

      {/* Order items */}
      <div className='border rounded-lg p-4 space-y-4'>
        {[...Array(2)].map((_, idx) => (
          <div key={idx} className='space-y-3 pb-4 border-b last:border-b-0'>
            {/* Item name */}
            <div className='h-5 w-full bg-gray-200 rounded-md animate-pulse' />

            {/* Price and quantity */}
            <div className='flex justify-between items-center'>
              <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
              <div className='h-4 w-16 bg-gray-200 rounded-md animate-pulse' />
            </div>
          </div>
        ))}
      </div>

      {/* Subtotal, discount, total */}
      <div className='space-y-3 border-t pt-4'>
        {/* Subtotal */}
        <div className='flex justify-between'>
          <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-4 w-24 bg-gray-200 rounded-md animate-pulse' />
        </div>

        {/* Discount */}
        <div className='flex justify-between'>
          <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-4 w-24 bg-gray-200 rounded-md animate-pulse' />
        </div>

        {/* Total */}
        <div className='flex justify-between pt-3 border-t'>
          <div className='h-6 w-20 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-6 w-32 bg-gray-200 rounded-md animate-pulse' />
        </div>
      </div>

      {/* Discount code input */}
      <div className='space-y-2'>
        <div className='h-4 w-24 bg-gray-200 rounded-md animate-pulse' />
        <div className='flex gap-2'>
          <div className='h-10 flex-1 bg-gray-200 rounded-md animate-pulse' />
          <div className='h-10 w-20 bg-gray-200 rounded-md animate-pulse' />
        </div>
      </div>
    </div>
  )
}

export default OrderSummarySkeleton
