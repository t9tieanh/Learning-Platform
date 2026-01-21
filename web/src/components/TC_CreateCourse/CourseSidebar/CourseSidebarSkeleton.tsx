import { Skeleton } from '@/components/ui/skeleton'

const CourseSidebarSkeleton = () => {
    return (
        <aside className='md:w-80 w-full bg-[#1D1D2A] border-r border-gray-800 overflow-y-auto text-white h-full'>
            <div className='p-6'>
                {/* Header Skeleton */}
                <div className='mb-6 space-y-2'>
                    <Skeleton className='h-6 w-3/4 bg-gray-700' />
                    <Skeleton className='h-4 w-full bg-gray-700' />
                </div>

                {/* Navigation Skeleton */}
                <div className='space-y-2'>
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className='flex items-center space-x-3 p-3'>
                            <Skeleton className='h-5 w-5 rounded-full bg-gray-700' />
                            <div className='flex-1 space-y-2'>
                                <Skeleton className='h-4 w-2/3 bg-gray-700' />
                                <Skeleton className='h-3 w-full bg-gray-700' />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </aside>
    )
}

export default CourseSidebarSkeleton
