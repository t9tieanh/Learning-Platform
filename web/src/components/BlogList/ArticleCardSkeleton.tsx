import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'

const ArticleCardSkeleton = () => {
  return (
    <Card className='animate-pulse border border-border bg-card'>
      <div className='aspect-video overflow-hidden relative'>
        <Skeleton className='w-full h-full bg-gray-200' />
      </div>

      <div className='p-6'>
        <Skeleton className='h-6 w-3/4 mb-4 bg-gray-200 rounded-md' />

        <div className='flex items-center gap-4 text-sm text-muted-foreground'>
          <div className='flex items-center gap-2'>
            <Skeleton className='w-8 h-8 rounded-full bg-gray-200' />
            <Skeleton className='h-4 w-24 bg-gray-200 rounded-md' />
          </div>
          <div className='ml-auto'>
            <Skeleton className='h-4 w-20 bg-gray-200 rounded-md' />
          </div>
        </div>
      </div>
    </Card>
  )
}

export default ArticleCardSkeleton
