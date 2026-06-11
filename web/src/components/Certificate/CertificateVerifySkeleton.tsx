import { Skeleton } from '@/components/ui/skeleton'

export default function CertificateVerifySkeleton() {
  return (
    <div className='space-y-5'>
      <div className='flex justify-center'>
        <Skeleton className='h-6 w-32 rounded-full' />
      </div>

      <div className='mx-auto w-full max-w-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.04)]'>
        <Skeleton className='h-32 w-full rounded-none sm:h-40' />

        <div className='px-6 py-6 sm:px-8 sm:py-7'>
          <div className='flex gap-4 sm:gap-5'>
            <Skeleton className='h-20 w-20 shrink-0 rounded-xl sm:h-24 sm:w-24' />

            <div className='min-w-0 flex-1 space-y-2'>
              <Skeleton className='h-3 w-20 rounded-md' />
              <Skeleton className='h-7 w-4/5 max-w-xs rounded-md sm:h-8' />
              <Skeleton className='h-4 w-40 rounded-md' />
              <Skeleton className='h-5 w-full max-w-sm rounded-md' />
            </div>
          </div>

          <div className='mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3'>
            <div className='space-y-2'>
              <Skeleton className='h-3 w-16 rounded-md' />
              <div className='flex items-center gap-2'>
                <Skeleton className='h-7 w-7 rounded-full' />
                <Skeleton className='h-4 w-24 rounded-md' />
              </div>
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-3 w-14 rounded-md' />
              <Skeleton className='h-4 w-28 rounded-md' />
            </div>
            <div className='space-y-2'>
              <Skeleton className='h-3 w-20 rounded-md' />
              <Skeleton className='h-4 w-32 rounded-md' />
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-center'>
        <Skeleton className='h-3 w-4/5 max-w-md rounded-md' />
      </div>

      <div className='flex flex-wrap justify-center gap-3 border-t border-slate-100 pt-4'>
        <Skeleton className='h-10 w-28 rounded-xl' />
        <Skeleton className='h-10 w-32 rounded-xl' />
      </div>
    </div>
  )
}
