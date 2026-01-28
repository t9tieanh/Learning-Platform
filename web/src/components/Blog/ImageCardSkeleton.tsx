import { Skeleton } from '@/components/ui/skeleton'

export const ImageCardSkeleton = () => {
    return (
        <div className='relative rounded-2xl overflow-hidden shadow-md mb-8'>
            <div className='aspect-video relative'>
                <Skeleton className='w-full h-full bg-gray-200' />
                <div className='absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent' />
            </div>
            <div className='absolute bottom-0 left-0 right-0 p-6 space-y-2'>
                <Skeleton className='h-6 w-full bg-white/20' />
                <Skeleton className='h-6 w-2/3 bg-white/20' />
            </div>
        </div>
    )
}
