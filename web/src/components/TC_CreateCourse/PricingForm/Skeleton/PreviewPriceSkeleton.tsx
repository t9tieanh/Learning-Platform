import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PreviewPriceSkeleton = () => {
    return (
        <Card className='shadow-lg bg-white'>
            <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                <CardTitle className='text-lg font-medium text-blue-900 flex items-center space-x-2'>
                    <Skeleton className='h-5 w-5 bg-blue-600' />
                    <Skeleton className='h-6 w-40 bg-blue-300' />
                </CardTitle>
                <Skeleton className='h-4 w-48 mt-1 bg-blue-200' />
            </CardHeader>

            <CardContent className='space-y-4'>
                <div className='space-y-3'>
                    <div className='flex justify-between items-center p-3 bg-blue-200/30 rounded-lg border shadow-md'>
                        <Skeleton className='h-5 w-24 bg-blue-300' />
                        <Skeleton className='h-5 w-20 bg-blue-300' />
                    </div>
                    <div className='flex justify-between items-center p-3 bg-yellow-50 rounded-lg shadow-md'>
                        <Skeleton className='h-5 w-24 bg-yellow-200' />
                        <Skeleton className='h-5 w-16 bg-yellow-200' />
                    </div>
                </div>

                <div className='flex justify-between items-center p-3 bg-green-50 rounded-lg shadow-md'>
                    <Skeleton className='h-5 w-32 bg-green-200' />
                    <Skeleton className='h-5 w-24 bg-green-200' />
                </div>

                <div className='pt-4 border-t border-blue-200'>
                    <Skeleton className='h-6 w-48 mb-2 bg-blue-200' />
                    <div className='space-y-2'>
                        <div className='flex justify-between'>
                            <Skeleton className='h-4 w-24 bg-blue-100' />
                            <Skeleton className='h-4 w-12 bg-blue-100' />
                        </div>
                        <div className='flex justify-between'>
                            <Skeleton className='h-4 w-24 bg-blue-100' />
                            <Skeleton className='h-4 w-12 bg-blue-100' />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default PreviewPriceSkeleton
