import { Skeleton } from '@/components/ui/skeleton'
import PriceFormSkeleton from './PriceFormSkeleton'
import PreviewPriceSkeleton from './PreviewPriceSkeleton'
import TitleSkeleton from '../../common/TitleSkeleton'

const PricingFormSkeleton = () => {
    return (
        <div className='max-w-6xl space-y-8 mx-auto'>
            {/* Title Component Skeleton */}
            <TitleSkeleton />

            <div className='grid lg:grid-cols-2 gap-8'>
                <div className='space-y-6'>
                    <PriceFormSkeleton />
                </div>

                <div className='space-y-6'>
                    <PreviewPriceSkeleton />
                </div>
            </div>
        </div>
    )
}

export default PricingFormSkeleton
