import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

const VipSuccessSkeleton = () => {
  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10'>
        {/* Logo */}
        <div className='flex justify-center mb-8'>
          <Skeleton className='h-8 w-32' />
        </div>

        {/* Hero */}
        <div className='flex flex-col items-center text-center gap-4 mb-8'>
          <Skeleton className='w-40 h-40 rounded-full' />
          <Skeleton className='h-7 w-36 rounded-full' />
          <Skeleton className='h-9 w-80' />
          <Skeleton className='h-4 w-64' />
          <Skeleton className='h-4 w-52' />
        </div>

        <div className='grid grid-cols-1 md:grid-cols-5 gap-6 items-start'>
          {/* Left — package card skeleton */}
          <div className='md:col-span-2 space-y-4'>
            <Card className='border-0 shadow-md overflow-hidden'>
              {/* Gradient header area */}
              <div className='bg-gray-200 animate-pulse p-6 h-36' />

              <CardContent className='pt-4 pb-5 space-y-4'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='flex justify-between'>
                    <Skeleton className='h-4 w-24' />
                    <Skeleton className='h-4 w-28' />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Order info card skeleton */}
            <Card className='border-0 shadow-sm'>
              <CardHeader className='pb-2 pt-4'>
                <Skeleton className='h-3 w-32' />
              </CardHeader>
              <CardContent className='pb-4 space-y-3'>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className='flex justify-between'>
                    <Skeleton className='h-4 w-16' />
                    <Skeleton className='h-4 w-32' />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Right — benefits skeleton */}
          <div className='md:col-span-3'>
            <Card className='border-0 shadow-md'>
              <CardHeader className='pb-3'>
                <Skeleton className='h-4 w-36' />
              </CardHeader>
              <CardContent>
                <ul className='space-y-6'>
                  {[...Array(4)].map((_, i) => (
                    <li key={i} className='flex gap-4'>
                      <Skeleton className='w-6 h-6 rounded-md flex-shrink-0' />
                      <div className='space-y-2 flex-1'>
                        <Skeleton className='h-4 w-48' />
                        <Skeleton className='h-3 w-full' />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Countdown button skeleton */}
        <div className='mt-8 flex justify-center'>
          <Skeleton className='h-10 w-72 rounded-md' />
        </div>
      </div>
    </div>
  )
}

export default VipSuccessSkeleton
