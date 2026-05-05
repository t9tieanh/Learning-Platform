import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const BaseInfomationSkeleton = () => {
  return (
    <div className='space-y-6'>
      <Card className='border border-gray-200 shadow-sm bg-white overflow-hidden'>
        <CardHeader className='bg-gray-50/90 border-b border-gray-100 py-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Skeleton className='h-5 w-5 rounded-md' />
            <Skeleton className='h-5 w-36' />
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-5 pt-5'>
          <div className='space-y-2'>
            <Skeleton className='h-3.5 w-28' />
            <Skeleton className='h-10 w-full rounded-xl' />
            <Skeleton className='h-3 w-20' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-3.5 w-40' />
            <Skeleton className='h-24 w-full rounded-xl' />
            <Skeleton className='h-3 w-24' />
          </div>
        </CardContent>
      </Card>

      <Card className='border border-gray-200 shadow-sm bg-white overflow-hidden'>
        <CardHeader className='bg-gray-50/90 border-b border-gray-100 py-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Skeleton className='h-5 w-5 rounded-md' />
            <Skeleton className='h-5 w-44' />
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-5'>
          <Skeleton className='h-[min(32rem,55vh)] w-full rounded-xl' />
        </CardContent>
      </Card>

      <Card className='border border-gray-200 shadow-sm bg-white overflow-hidden'>
        <CardHeader className='bg-gray-50/90 border-b border-gray-100 py-4'>
          <CardTitle className='flex items-center gap-2 text-base'>
            <Skeleton className='h-5 w-5 rounded-md' />
            <Skeleton className='h-5 w-36' />
          </CardTitle>
        </CardHeader>
        <CardContent className='pt-5 grid md:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <Skeleton className='h-3.5 w-24' />
            <Skeleton className='h-10 w-full rounded-xl' />
          </div>
        </CardContent>
      </Card>

      <div className='space-y-3'>
        <Skeleton className='h-10 w-full rounded-xl' />
        <Skeleton className='h-10 w-full rounded-xl' />
      </div>

      <Skeleton className='h-10 w-36 rounded-lg' />
    </div>
  )
}

export default BaseInfomationSkeleton
