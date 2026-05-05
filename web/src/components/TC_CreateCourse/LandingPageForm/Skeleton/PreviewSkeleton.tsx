import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PreviewSkeleton = () => {
  return (
    <Card className='border border-gray-200 shadow-sm bg-white overflow-hidden lg:sticky lg:top-4'>
      <CardHeader className='border-b border-gray-100 bg-gray-50/80 py-4'>
        <CardTitle className='flex items-center gap-2 text-base'>
          <Skeleton className='h-5 w-5 rounded-md' />
          <Skeleton className='h-5 w-40' />
        </CardTitle>
      </CardHeader>

      <CardContent className='space-y-4 pt-5'>
        <div className='flex gap-2'>
          <Skeleton className='h-8 w-24 rounded-md' />
          <Skeleton className='h-8 w-24 rounded-md bg-neutral-200/45' />
        </div>

        <Skeleton className='aspect-video w-full rounded-xl' />

        <div className='space-y-3'>
          <Skeleton className='h-7 w-4/5 max-w-md' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-2/3' />

          <div className='flex flex-wrap gap-2 pt-1'>
            <Skeleton className='h-6 w-16 rounded-md' />
            <Skeleton className='h-6 w-20 rounded-md' />
            <Skeleton className='h-6 w-14 rounded-md' />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default PreviewSkeleton
