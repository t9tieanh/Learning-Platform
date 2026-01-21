import { Skeleton } from '@/components/ui/skeleton'
import BaseInfomationSkeleton from './BaseInfomationSkeleton'
import PreviewSkeleton from './PreviewSkeleton'
import TitleSkeleton from '../../common/TitleSkeleton'

const LandingPageFormSkeleton = () => {
    return (
        <div className='max-w-6xl mx-auto space-y-10 px-4'>
            {/* Title Skeleton */}
            <TitleSkeleton />

            <div className='grid lg:grid-cols-2 gap-10'>
                {/* Form Section Skeleton */}
                <div className='space-y-8'>
                    {/* Tabs List Skeleton */}
                    <div className='grid grid-cols-3 gap-1 bg-blue-200 rounded-xl p-1'>
                        <Skeleton className='h-10 rounded-lg bg-blue-500' />
                        <Skeleton className='h-10 rounded-lg bg-blue-100' />
                        <Skeleton className='h-10 rounded-lg bg-blue-100' />
                    </div>

                    {/* Content Skeleton (Default to Base Info) */}
                    <BaseInfomationSkeleton />
                </div>

                {/* Preview Section Skeleton */}
                <div className='space-y-8'>
                    <PreviewSkeleton />
                </div>
            </div>
        </div>
    )
}

export default LandingPageFormSkeleton
