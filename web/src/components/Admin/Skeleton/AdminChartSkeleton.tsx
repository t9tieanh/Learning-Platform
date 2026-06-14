import { Skeleton } from '@/components/ui/skeleton'

export default function AdminChartSkeleton({ heightClassName = 'h-[220px]' }: { heightClassName?: string }) {
  return (
    <div className={heightClassName}>
      <Skeleton className='h-full w-full rounded-xl' />
    </div>
  )
}
