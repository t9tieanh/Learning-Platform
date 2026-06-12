import { Skeleton } from '@/components/ui/skeleton'
import AdminStatCardsSkeleton from './AdminStatCardsSkeleton'
import AdminCoursesTableSkeleton from './AdminCoursesTableSkeleton'

export function AdminInstructorHeroSkeleton() {
  return (
    <div className='flex flex-col gap-5 sm:flex-row sm:items-start'>
      <Skeleton className='h-24 w-24 rounded-full' />
      <div className='max-w-3xl flex-1 space-y-3'>
        <Skeleton className='h-4 w-32 rounded-md' />
        <Skeleton className='h-8 w-56 max-w-full rounded-md' />
        <Skeleton className='h-4 w-40 rounded-md' />
        <Skeleton className='h-4 w-64 rounded-md' />
        <Skeleton className='h-16 w-full max-w-2xl rounded-md' />
        <div className='flex flex-wrap gap-2'>
          <Skeleton className='h-7 w-24 rounded-full' />
          <Skeleton className='h-7 w-28 rounded-full' />
          <Skeleton className='h-7 w-20 rounded-full' />
        </div>
      </div>
    </div>
  )
}

export default function AdminInstructorDetailSkeleton() {
  return (
    <div className='space-y-5 lg:space-y-8'>
      <section className='rounded-[28px] border border-slate-200/80 bg-slate-900/90 px-4 py-6 sm:px-6 sm:py-7'>
        <Skeleton className='mb-6 h-10 w-44 rounded-full' />
        <AdminInstructorHeroSkeleton />
      </section>

      <AdminStatCardsSkeleton count={4} columnsClassName='grid gap-4 md:grid-cols-2 xl:grid-cols-4' />

      <section className='overflow-hidden rounded-[30px] border border-slate-200/80 bg-white/95 shadow-[0_22px_55px_-36px_rgba(15,23,42,0.24)]'>
        <div className='border-b border-slate-200/80 px-6 py-5'>
          <Skeleton className='h-6 w-40 rounded-md' />
          <Skeleton className='mt-2 h-4 w-72 max-w-full rounded-md' />
        </div>
        <AdminCoursesTableSkeleton rows={5} />
      </section>
    </div>
  )
}
