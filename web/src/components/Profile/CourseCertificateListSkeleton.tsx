import { Skeleton } from '@/components/ui/skeleton'

function CourseCertificateItemSkeleton() {
  return (
    <article className='rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]'>
      <div className='flex flex-col gap-4 sm:flex-row'>
        <Skeleton className='h-16 w-16 shrink-0 rounded-xl' />

        <div className='flex min-w-0 flex-1 flex-col justify-center gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Skeleton className='h-5 w-14 rounded-md' />
            <Skeleton className='h-4 w-24 rounded-md' />
          </div>
          <Skeleton className='h-5 w-4/5 max-w-sm rounded-md' />
          <div className='flex flex-wrap gap-3'>
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-4 w-32 rounded-md' />
          </div>
        </div>

        <div className='flex shrink-0 gap-2 sm:flex-col sm:items-end sm:justify-center'>
          <Skeleton className='h-9 w-28 rounded-xl' />
          <Skeleton className='h-9 w-24 rounded-xl' />
        </div>
      </div>
    </article>
  )
}

export default function CourseCertificateListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className='space-y-3'>
      {Array.from({ length: count }).map((_, index) => (
        <CourseCertificateItemSkeleton key={index} />
      ))}
    </div>
  )
}
