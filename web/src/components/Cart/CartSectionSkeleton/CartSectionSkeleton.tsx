const CartItemSkeleton = () => {
  return (
    <div className='p-4 bg-white border-b'>
      <div className='flex items-start gap-4'>
        {/* Thumbnail skeleton */}
        <div className='h-24 w-24 bg-gray-200 rounded-lg animate-pulse flex-shrink-0' />

        {/* Content skeleton */}
        <div className='flex-1 space-y-3'>
          {/* Title */}
          <div className='h-5 w-3/4 bg-gray-200 rounded-md animate-pulse' />

          {/* Price info */}
          <div className='flex gap-4'>
            <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
            <div className='h-4 w-20 bg-gray-200 rounded-md animate-pulse' />
          </div>

          {/* Instructor */}
          <div className='flex items-center gap-2'>
            <div className='h-8 w-8 rounded-full bg-gray-200 animate-pulse' />
            <div className='h-4 w-24 bg-gray-200 rounded-md animate-pulse' />
          </div>
        </div>

        {/* Delete button skeleton */}
        <div className='h-10 w-10 bg-gray-200 rounded-md animate-pulse flex-shrink-0' />
      </div>
    </div>
  )
}

const CartSectionSkeleton = () => {
  return (
    <div className='cart-section p-5 bg-white rounded-lg min-h-95 md:min-h-[480px] shadow-sm'>
      <div className='total-cart-item'>
        <div className='h-6 w-48 bg-gray-200 rounded-md animate-pulse mb-3' />
        <hr />
      </div>
      <div className='cart-item flex flex-col'>
        {[...Array(3)].map((_, idx) => (
          <CartItemSkeleton key={idx} />
        ))}
      </div>
    </div>
  )
}

export default CartSectionSkeleton
