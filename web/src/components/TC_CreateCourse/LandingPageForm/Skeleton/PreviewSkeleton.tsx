import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PreviewSkeleton = () => {
    return (
        <Card className='border border-blue-200 shadow-md bg-blue-50'>
            <CardHeader>
                <CardTitle className='flex items-center space-x-2'>
                    <Skeleton className='h-5 w-5 bg-blue-500' />
                    <Skeleton className='h-6 w-40 bg-blue-900' />
                </CardTitle>
            </CardHeader>

            <CardContent className='space-y-4'>
                {/* Tabs Skeleton */}
                <div className='flex space-x-2'>
                    <Skeleton className='h-8 w-24 bg-blue-200 rounded-md' />
                    <Skeleton className='h-8 w-24 bg-blue-200 rounded-md' />
                </div>

                {/* Media Preview */}
                <Skeleton className='aspect-video w-full bg-blue-100 rounded-lg' />

                <div className='space-y-3'>
                    <Skeleton className='h-7 w-3/4 bg-blue-900' />
                    <Skeleton className='h-4 w-full bg-blue-700' />
                    <Skeleton className='h-4 w-2/3 bg-blue-700' />

                    <div className='flex flex-wrap gap-2 pt-2'>
                        <Skeleton className='h-6 w-16 bg-blue-100 rounded-md' />
                        <Skeleton className='h-6 w-20 bg-blue-100 rounded-md' />
                        <Skeleton className='h-6 w-14 bg-blue-100 rounded-md' />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PreviewSkeleton
