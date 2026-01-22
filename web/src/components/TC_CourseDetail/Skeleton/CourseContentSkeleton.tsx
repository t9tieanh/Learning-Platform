import { Skeleton } from '@/components/ui/skeleton'

export const CourseContentSkeleton = () => {
    return (
        <div className='space-y-8'>
            {/* Summary */}
            <div className='space-y-4'>
                <Skeleton className='h-20 w-full rounded-lg' />
                <div className='flex gap-4'>
                    <Skeleton className='h-16 w-32 rounded-lg' />
                    <Skeleton className='h-16 w-32 rounded-lg' />
                    <Skeleton className='h-16 w-32 rounded-lg' />
                </div>
            </div>

            {/* Learning Outcomes */}
            <div className='space-y-4 border p-6 rounded-xl'>
                <Skeleton className='h-6 w-48' />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className='flex gap-2'>
                            <Skeleton className='h-5 w-5 rounded-full flex-shrink-0' />
                            <Skeleton className='h-5 w-full' />
                        </div>
                    ))}
                </div>
            </div>

            {/* Curriculum */}
            <div className='space-y-4'>
                <Skeleton className='h-6 w-32' />
                <div className='space-y-2'>
                    {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className='h-14 w-full rounded-lg' />
                    ))}
                </div>
            </div>

            {/* Description */}
            <div className='space-y-4'>
                <Skeleton className='h-6 w-40' />
                <div className='space-y-2'>
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-full' />
                    <Skeleton className='h-4 w-3/4' />
                </div>
            </div>
        </div>
    )
}
