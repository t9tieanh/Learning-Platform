import { Skeleton } from '@/components/ui/skeleton'

export const ConversationListSkeleton = () => {
    return (
        <div className='flex h-full flex-col bg-white border-r border-slate-200 animate-pulse'>
            {/* Header Skeleton */}
            <div className='p-5 border-b bg-white'>
                <div className='flex justify-between items-center mb-3'>
                    <Skeleton className='h-8 w-32 rounded-md' />
                </div>
                <div className='relative'>
                    <Skeleton className='h-10 w-full rounded-xl' />
                </div>
            </div>

            {/* List Skeleton */}
            <div className='flex-1 overflow-y-auto p-0'>
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className='flex items-center gap-3 p-4 border-b border-slate-50'>
                        <Skeleton className='h-12 w-12 rounded-full flex-shrink-0' />
                        <div className='flex-1 space-y-2'>
                            <div className='flex justify-between'>
                                <Skeleton className='h-4 w-24 rounded' />
                                <Skeleton className='h-3 w-10 rounded' />
                            </div>
                            <Skeleton className='h-3 w-3/4 rounded' />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
