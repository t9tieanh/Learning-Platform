import { Skeleton } from '@/components/ui/skeleton'

export const CourseHeroSkeleton = () => {
    return (
        <div className='relative overflow-hidden rounded-2xl shadow-lg bg-gray-100 dark:bg-slate-800'>
            <div className='relative grid gap-6 p-8 lg:grid-cols-2 lg:gap-8'>
                <div className='flex flex-col space-y-6'>
                    {/* Title */}
                    <Skeleton className='h-10 w-3/4' />

                    {/* Badges */}
                    <div className='flex items-center gap-3 flex-wrap'>
                        <Skeleton className='h-6 w-20 rounded-full' />
                        <Skeleton className='h-6 w-32 rounded-md' />
                        <Skeleton className='h-6 w-24 rounded-full' />
                    </div>

                    {/* Buttons */}
                    <div className='flex gap-3 pt-4'>
                        <Skeleton className='h-12 w-32 rounded-md' />
                        <Skeleton className='h-12 w-32 rounded-md' />
                    </div>
                </div>

                {/* Video Placeholder */}
                <div className='relative aspect-video overflow-hidden rounded-xl'>
                    <Skeleton className='h-full w-full' />
                </div>
            </div>
        </div>
    )
}
