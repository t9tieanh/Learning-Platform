import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const BaseInfomationSkeleton = () => {
    return (
        <div className='space-y-6'>
            {/* Course Info Card */}
            <Card className='border border-blue-200 shadow-sm bg-blue-50'>
                <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                    <CardTitle className='flex items-center gap-2'>
                        <Skeleton className='w-5 h-5 bg-blue-300' />
                        <Skeleton className='h-6 w-40 bg-blue-300' />
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-5'>
                    <div>
                        <Skeleton className='h-4 w-32 mb-2 bg-blue-200' />
                        <Skeleton className='h-10 w-full bg-white' />
                        <Skeleton className='h-3 w-20 mt-1 bg-blue-200' />
                    </div>
                    <div>
                        <Skeleton className='h-4 w-40 mb-2 bg-blue-200' />
                        <Skeleton className='h-24 w-full bg-white' />
                        <Skeleton className='h-3 w-24 mt-1 bg-blue-200' />
                    </div>
                </CardContent>
            </Card>

            {/* Description Card */}
            <Card className='border border-blue-200 shadow-sm bg-blue-50'>
                <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                    <CardTitle className='flex items-center gap-2'>
                        <Skeleton className='w-5 h-5 bg-blue-300' />
                        <Skeleton className='h-6 w-48 bg-blue-300' />
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Skeleton className='h-[32rem] w-full bg-white mt-2' />
                </CardContent>
            </Card>

            {/* Basic Info Card */}
            <Card className='border border-blue-200 shadow-sm bg-blue-50'>
                <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                    <CardTitle className='flex items-center gap-2'>
                        <Skeleton className='w-5 h-5 bg-blue-300' />
                        <Skeleton className='h-6 w-40 bg-blue-300' />
                    </CardTitle>
                </CardHeader>
                <CardContent className='grid md:grid-cols-2 gap-6'>
                    <div>
                        <Skeleton className='h-4 w-24 mb-2 bg-blue-200' />
                        <Skeleton className='h-10 w-full bg-white' />
                    </div>
                </CardContent>
            </Card>

            {/* Dynamic Inputs Skeleton */}
            <div className='space-y-4'>
                <Skeleton className='h-10 w-full bg-blue-100' />
                <Skeleton className='h-10 w-full bg-blue-100' />
            </div>

            <Skeleton className='h-10 w-32 bg-blue-500 rounded-lg shadow mt-4' />
        </div>
    )
}

export default BaseInfomationSkeleton
