import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PriceFormSkeleton = () => {
    return (
        <Card className='bg-white shadow-lg'>
            <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                <CardTitle className='text-lg font-medium text-blue-900'>
                    <Skeleton className='h-6 w-32 bg-blue-300' />
                </CardTitle>
            </CardHeader>

            <CardContent className='space-y-5'>
                {/* Price Input Skeleton 1 */}
                <div className='space-y-2'>
                    <Skeleton className='h-5 w-40 bg-blue-200' />
                    <Skeleton className='h-4 w-64 bg-gray-200' />
                    <Skeleton className='h-10 w-full bg-white border border-blue-100' />
                </div>

                {/* Price Input Skeleton 2 */}
                <div className='space-y-2'>
                    <Skeleton className='h-5 w-64 bg-blue-200' />
                    <Skeleton className='h-4 w-56 bg-gray-200' />
                    <Skeleton className='h-10 w-full bg-white border border-blue-100' />
                </div>

                <Skeleton className='h-4 w-full bg-blue-50' />

                <div className='flex justify-end'>
                    <Skeleton className='h-10 w-32 rounded-lg bg-blue-500' />
                </div>
            </CardContent>
        </Card>
    )
}

export default PriceFormSkeleton
