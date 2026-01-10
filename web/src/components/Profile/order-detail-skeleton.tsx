import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { User } from 'lucide-react'

const OrderDetailSkeleton = () => {
  return (
    <Card className='border-none p-0 m-0'>
      <CardContent className='p-0'>
        <div className='rounded-lg space-y-4'>
          {/* Customer info skeleton */}
          <div className='relative my-4'>
            <div className='absolute -top-3 left-4 bg-gray-200 px-2 rounded text-sm font-medium flex items-center shadow-sm'>
              <User className='mr-1 w-4 h-4' />
              <span>Thông tin khách hàng</span>
            </div>
            <div className='border rounded-lg p-4 pt-6 bg-white space-y-2'>
              <Skeleton className='h-4 w-32 bg-gray-200 animate-pulse' />
              <Skeleton className='h-3 w-48 bg-gray-200 animate-pulse' />
            </div>
          </div>

          {/* Order items skeleton */}
          <div className='space-y-4'>
            {[1, 2].map((item) => (
              <div key={item} className='flex justify-between items-center py-4 rounded-md'>
                <div className='flex items-center gap-2 w-full'>
                  <Skeleton className='w-8 h-8 rounded-md bg-gray-200 animate-pulse' />
                  <div className='flex-1 space-y-2'>
                    <Skeleton className='h-4 w-40 bg-gray-200 animate-pulse' />
                    <Skeleton className='h-3 w-24 bg-gray-200 animate-pulse' />
                  </div>
                </div>
                <Skeleton className='h-4 w-20 bg-gray-200 animate-pulse' />
              </div>
            ))}
          </div>

          {/* Summary skeleton */}
          <div className='mt-4 space-y-3'>
            <div className='flex items-center justify-between'>
              <Skeleton className='h-4 w-20 bg-gray-200 animate-pulse' />
              <Skeleton className='h-5 w-24 bg-gray-200 animate-pulse' />
            </div>
            <Skeleton className='h-16 w-full rounded-md bg-gray-200 animate-pulse' />
            <div className='border-t pt-4 flex items-center justify-between'>
              <Skeleton className='h-4 w-16 bg-gray-200 animate-pulse' />
              <Skeleton className='h-6 w-28 bg-gray-200 animate-pulse' />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default OrderDetailSkeleton
