import { Skeleton } from '@/components/ui/skeleton'

export const ChatAreaSkeleton = () => {
    return (
        <div className='flex flex-col flex-1 h-full bg-gray-50 animate-pulse'>
            {/* Header Skeleton */}
            <div className='flex items-center justify-between px-4 py-3 bg-white border-b shadow-sm'>
                <div className='flex items-center gap-3'>
                    <Skeleton className='h-10 w-10 rounded-full' />
                    <Skeleton className='h-5 w-32 rounded' />
                </div>
            </div>

            {/* Messages Skeleton */}
            <div className='flex-1 overflow-y-auto px-4 py-4 space-y-6'>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className={`flex gap-2 ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
                        {i % 2 === 0 && <Skeleton className='h-8 w-8 rounded-full' />}
                        <div className={`flex flex-col gap-1 max-w-[60%] ${i % 2 === 0 ? 'items-start' : 'items-end'}`}>
                            <Skeleton className={`h-10 rounded-2xl w-[200px] ${i % 2 === 0 ? 'rounded-bl-none' : 'rounded-br-none'}`} />
                            <Skeleton className='h-3 w-16 rounded' />
                        </div>
                    </div>
                ))}
            </div>

            {/* Input Skeleton */}
            <div className='p-4 bg-white border-t shadow-sm'>
                <div className='flex items-center gap-3'>
                    <Skeleton className='flex-1 h-10 rounded-full' />
                    <Skeleton className='h-10 w-10 rounded-full' />
                </div>
            </div>
        </div>
    )
}
