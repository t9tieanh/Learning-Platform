import { Skeleton } from '@/components/ui/skeleton'
import LessonFormSkeleton from './LessonFormSkeleton'

const ChapterFormSkeleton = () => {
    return (
        <div className='border border-blue-200 rounded-xl shadow-sm bg-white'>
            {/* Chapter Header Skeleton */}
            <div className='flex items-center justify-between p-4 border-b border-blue-200'>
                <div className='flex items-center space-x-3 w-2/3'>
                    <Skeleton className='h-4 w-4 bg-blue-300' />
                    <Skeleton className='h-4 w-4 bg-blue-300' />
                    <Skeleton className='h-5 w-16 bg-blue-200' />
                    <Skeleton className='h-5 w-1/2 bg-blue-100' />
                </div>
                <div className='flex items-center space-x-2'>
                    <Skeleton className='h-6 w-16 rounded-full bg-blue-50' />
                    <Skeleton className='h-8 w-8 rounded-md bg-gray-100' />
                </div>
            </div>

            {/* Chapter Content Skeleton (Simulate open state) */}
            <div className='p-4 space-y-2'>
                <LessonFormSkeleton />
                <LessonFormSkeleton />

                <div className='flex space-x-2 mt-6'>
                    <Skeleton className='h-9 w-32 rounded-md bg-blue-50' />
                    <Skeleton className='h-9 w-32 rounded-md bg-blue-50' />
                </div>
            </div>
        </div>
    )
}

export default ChapterFormSkeleton
