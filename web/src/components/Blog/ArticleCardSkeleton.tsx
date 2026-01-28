import { Skeleton } from '@/components/ui/skeleton'

export const ArticleCardSkeleton = () => {
    return (
        <div className='flex gap-4 items-start mb-2'>
            <Skeleton className='w-28 h-20 rounded-lg flex-shrink-0 bg-gray-200' />
            <div className='flex-1 space-y-2'>
                <Skeleton className='h-3 w-16 bg-gray-200' />
                <Skeleton className='h-4 w-full bg-gray-200' />
                <Skeleton className='h-4 w-2/3 bg-gray-200' />
            </div>
        </div>
    )
}
