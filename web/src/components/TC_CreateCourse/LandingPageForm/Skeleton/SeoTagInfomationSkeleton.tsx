import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const SeoTagInfomationSkeleton = () => {
    return (
        <Card className='border border-blue-200 shadow-md bg-blue-50'>
            <CardHeader>
                <CardTitle>
                    <Skeleton className='h-6 w-32 bg-blue-300' />
                </CardTitle>
                <Skeleton className='h-4 w-64 bg-blue-200' />
            </CardHeader>

            <CardContent className='space-y-4'>
                {/* Tags Grid */}
                <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-4'>
                    {Array.from({ length: 10 }).map((_, i) => (
                        <Skeleton key={i} className='h-10 w-full bg-white rounded-md border border-blue-200' />
                    ))}
                </div>

                <div className='flex justify-end'>
                    <Skeleton className='h-10 w-32 bg-blue-500 rounded-lg' />
                </div>

                <Skeleton className='h-3 w-24 bg-blue-200' />
            </CardContent>
        </Card>
    )
}

export default SeoTagInfomationSkeleton
