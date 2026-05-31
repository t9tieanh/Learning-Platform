import { Skeleton } from '@/components/ui/skeleton'

function CourseCertificateItemSkeleton() {
  return (
    <article className='relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white via-white to-blue-50/40'>
      <div className='absolute top-0 left-0 w-1 h-full bg-slate-200' />

      <div className='flex flex-col sm:flex-row gap-4 p-4 pl-5'>
        <Skeleton className='h-[72px] w-[72px] shrink-0 rounded-2xl' />

        <div className='flex-1 min-w-0 flex flex-col justify-center gap-2'>
          <div className='flex flex-wrap items-center gap-2'>
            <Skeleton className='h-5 w-16 rounded-full' />
            <Skeleton className='h-4 w-24 rounded-md' />
          </div>
          <Skeleton className='h-5 w-4/5 max-w-sm rounded-md' />
          <div className='flex flex-wrap gap-3'>
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-4 w-32 rounded-md' />
          </div>
        </div>

        <div className='flex sm:flex-col gap-2 sm:items-end sm:justify-center shrink-0'>
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
