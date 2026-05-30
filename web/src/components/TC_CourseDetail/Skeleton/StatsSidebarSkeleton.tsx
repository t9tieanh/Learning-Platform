import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export const StatsSidebarSkeleton = () => {
  return (
    <div className='sticky top-6 space-y-6'>
      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_10px_28px_rgba(15,23,42,0.05)]'>
        <Skeleton className='mb-6 h-6 w-32 bg-slate-200' />

        <div className='space-y-4'>
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className='flex items-center gap-3 py-2'>
                <Skeleton className='h-10 w-10 rounded-lg bg-slate-200' />
                <div className='space-y-2'>
                  <Skeleton className='h-3 w-16 bg-slate-200' />
                  <Skeleton className='h-5 w-24 bg-slate-200' />
                </div>
              </div>
              {i < 3 && <Separator className='my-2 bg-slate-200' />}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
