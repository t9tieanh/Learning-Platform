import { Skeleton } from '@/components/ui/skeleton'

export default function AdminLeaderboardSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className='space-y-2.5'>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className='flex items-center gap-3 rounded-xl border border-slate-100 p-3'>
          <Skeleton className='h-8 w-8 rounded-full' />
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-40 max-w-full rounded-md' />
            <Skeleton className='h-3 w-56 max-w-full rounded-md' />
          </div>
        </div>
      ))}
    </div>
  )
}
