import { Skeleton } from '@/components/ui/skeleton'
import BaseInfomationSkeleton from './BaseInfomationSkeleton'
import PreviewSkeleton from './PreviewSkeleton'
import TitleSkeleton from '../../common/TitleSkeleton'

const LandingPageFormSkeleton = () => {
  return (
    <div className='max-w-7xl w-full mx-auto space-y-8 md:space-y-10 px-0'>
      <TitleSkeleton />

      <div className='grid lg:grid-cols-2 gap-8 lg:gap-10'>
        <div className='space-y-8 min-w-0'>
          <div className='grid grid-cols-3 gap-1 rounded-xl p-1 bg-gray-100 border border-gray-200/80'>
            <Skeleton className='h-10 rounded-lg' />
            <Skeleton className='h-10 rounded-lg bg-neutral-200/40' />
            <Skeleton className='h-10 rounded-lg bg-neutral-200/40' />
          </div>

          <BaseInfomationSkeleton />
        </div>

        <div className='space-y-8 min-w-0'>
          <PreviewSkeleton />
        </div>
      </div>
    </div>
  )
}

export default LandingPageFormSkeleton
