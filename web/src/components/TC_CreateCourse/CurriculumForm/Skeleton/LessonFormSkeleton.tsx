import { Skeleton } from '@/components/ui/skeleton'

const LessonFormSkeleton = () => {
    return (
        <div className='flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50'>
            <div className='flex items-center space-x-3 w-full'>
                <Skeleton className='h-4 w-4 bg-gray-300' />
                <div className='flex-1 space-y-2'>
                    <div className='flex items-center space-x-2'>
                        <Skeleton className='h-4 w-4 bg-gray-300' />
                        <Skeleton className='h-4 w-1/2 bg-gray-300' />
                    </div>
                </div>
            </div>
            <div className='flex items-center space-x-2'>
                <Skeleton className='h-8 w-8 rounded-md bg-gray-200' />
                <Skeleton className='h-8 w-8 rounded-md bg-gray-200' />
            </div>
        </div>
    )
}

export default LessonFormSkeleton
