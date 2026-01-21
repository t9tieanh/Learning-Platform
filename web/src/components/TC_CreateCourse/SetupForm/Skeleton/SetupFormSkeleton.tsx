import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import TitleSkeleton from '../../common/TitleSkeleton'

const SetupFormSkeleton = () => {
    return (
        <div className='max-w-6xl space-y-8 mx-auto'>
            {/* Title Component Skeleton */}
            <TitleSkeleton />

            <div className='gap-8'>
                <div className='space-y-6'>
                    <Card className='border border-blue-200 shadow-sm bg-blue-50'>
                        <CardHeader className='bg-blue-200/40 rounded-t-lg'>
                            <CardTitle className='text-lg font-medium text-blue-900 flex gap-2 items-center'>
                                <Skeleton className='h-5 w-5 bg-blue-600' />
                                <Skeleton className='h-6 w-40 bg-blue-300' />
                            </CardTitle>
                        </CardHeader>
                        <CardContent className='space-y-3'>
                            <div className='grid grid-cols-3 gap-4'>
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className='text-center p-3 bg-blue-100 rounded-lg flex flex-col items-center gap-2'>
                                        <Skeleton className='h-7 w-16 bg-blue-300' />
                                        <Skeleton className='h-3 w-12 bg-blue-200' />
                                    </div>
                                ))}
                            </div>

                            <div className='flex justify-end pt-2'>
                                <Skeleton className='h-10 w-48 rounded-lg bg-blue-500' />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

export default SetupFormSkeleton
