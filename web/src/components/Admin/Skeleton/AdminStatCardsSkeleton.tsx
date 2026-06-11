import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface AdminStatCardsSkeletonProps {
  count?: number
  className?: string
  columnsClassName?: string
}

export default function AdminStatCardsSkeleton({
  count = 2,
  className,
  columnsClassName = 'grid gap-4 md:grid-cols-2'
}: AdminStatCardsSkeletonProps) {
  return (
    <div className={cn(columnsClassName, className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className='rounded-[28px] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.22)]'
        >
          <div className='flex items-center gap-4'>
            <Skeleton className='h-12 w-12 rounded-2xl' />
            <div className='space-y-2'>
              <Skeleton className='h-4 w-24 rounded-md' />
              <Skeleton className='h-7 w-16 rounded-md' />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
