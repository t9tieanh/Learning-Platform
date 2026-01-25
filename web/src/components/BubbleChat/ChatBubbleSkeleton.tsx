import { Skeleton } from '@/components/ui/skeleton'

const ChatBubbleSkeleton = () => {
    return (
        <div className='space-y-4 p-1'>
            {/* AI Message Skeleton */}
            <div className='flex justify-start'>
                <Skeleton className='h-12 w-3/4 rounded-2xl rounded-bl-md bg-gray-200' />
            </div>

            {/* User Message Skeleton */}
            <div className='flex justify-end'>
                <Skeleton className='h-10 w-1/2 rounded-2xl rounded-br-md bg-gray-200' />
            </div>

            {/* AI Message Skeleton */}
            <div className='flex justify-start'>
                <Skeleton className='h-16 w-4/5 rounded-2xl rounded-bl-md bg-gray-200' />
            </div>

            {/* User Message Skeleton */}
            <div className='flex justify-end'>
                <Skeleton className='h-10 w-1/3 rounded-2xl rounded-br-md bg-gray-200' />
            </div>
        </div>
    )
}

export default ChatBubbleSkeleton
