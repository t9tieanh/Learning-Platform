import { Skeleton } from '@/components/ui/skeleton'

const TitleSkeleton = () => {
    return (
        <div className='mb-8 bg-blue-950 rounded-xl shadow-lg p-6 space-y-3'>
            <div className='flex items-center gap-2'>
                <Skeleton className='h-8 w-8 rounded-full bg-blue-800' />
                <Skeleton className='h-8 w-64 bg-blue-800' />
            </div>
            <Skeleton className='h-4 w-full bg-blue-900/50' />
            <Skeleton className='h-4 w-2/3 bg-blue-900/50' />
        </div>
    )
}

export default TitleSkeleton
