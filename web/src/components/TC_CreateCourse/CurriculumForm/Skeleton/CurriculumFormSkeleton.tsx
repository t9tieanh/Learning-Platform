import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ChapterFormSkeleton from './ChapterFormSkeleton'
import TitleSkeleton from '../../common/TitleSkeleton'

const CurriculumFormSkeleton = () => {
    return (
        <div className='max-w-6xl space-y-8 mx-auto'>
            {/* Title Component Skeleton */}
            <div className='space-y-4'>
                <TitleSkeleton />

                {/* Stats Skeleton */}
                <div className='flex space-x-6 mt-2'>
                    <Skeleton className='h-5 w-20 bg-blue-50' />
                    <Skeleton className='h-5 w-24 bg-blue-50' />
                    <Skeleton className='h-5 w-32 bg-blue-50' />
                </div>
            </div>

            {/* Content Card Skeleton */}
            <Card className='border border-blue-200/60 shadow-lg bg-white'>
                <CardHeader className='pb-0'>
                    <CardTitle>
                        <Skeleton className='h-6 w-40 bg-gray-200' />
                    </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4 mt-4'>
                    <ChapterFormSkeleton />
                    <ChapterFormSkeleton />

                    <Skeleton className='h-20 w-full rounded-xl border-2 border-dashed border-blue-200 bg-blue-50' />
                </CardContent>
            </Card>
        </div>
    )
}

export default CurriculumFormSkeleton
