import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

function AdminCourseTableRowSkeleton() {
  return (
    <TableRow className='border-b border-slate-100'>
      <TableCell className='px-6 py-4'>
        <div className='flex items-center gap-4'>
          <Skeleton className='h-14 w-20 rounded-2xl' />
          <div className='min-w-0 flex-1 space-y-2'>
            <Skeleton className='h-4 w-48 max-w-full rounded-md' />
            <Skeleton className='h-3 w-64 max-w-full rounded-md' />
          </div>
        </div>
      </TableCell>
      <TableCell className='px-6 py-4'>
        <div className='flex items-center gap-3'>
          <Skeleton className='h-10 w-10 rounded-full' />
          <div className='space-y-2'>
            <Skeleton className='h-4 w-28 rounded-md' />
            <Skeleton className='h-3 w-36 rounded-md' />
          </div>
        </div>
      </TableCell>
      <TableCell className='px-6 py-4'>
        <Skeleton className='h-7 w-24 rounded-full' />
      </TableCell>
      <TableCell className='px-6 py-4'>
        <Skeleton className='h-7 w-20 rounded-full' />
      </TableCell>
      <TableCell className='px-6 py-4 text-right'>
        <Skeleton className='ml-auto h-9 w-32 rounded-xl' />
      </TableCell>
    </TableRow>
  )
}

function AdminCourseMobileCardSkeleton() {
  return (
    <article className='rounded-3xl border border-slate-200 bg-white p-4 shadow-sm'>
      <div className='flex items-start gap-3'>
        <Skeleton className='h-16 w-24 rounded-2xl' />
        <div className='min-w-0 flex-1 space-y-2'>
          <Skeleton className='h-5 w-full max-w-xs rounded-md' />
          <Skeleton className='h-4 w-32 rounded-md' />
          <Skeleton className='h-3 w-40 rounded-md' />
        </div>
      </div>
      <Skeleton className='mt-3 h-4 w-full rounded-md' />
      <div className='mt-4 grid gap-3 sm:grid-cols-2'>
        <Skeleton className='h-14 rounded-2xl' />
        <Skeleton className='h-14 rounded-2xl' />
      </div>
      <Skeleton className='mt-4 h-11 w-full rounded-2xl' />
    </article>
  )
}

export default function AdminCoursesTableSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      <div className='hidden overflow-x-auto lg:block'>
        <Table className='min-w-[980px]'>
          <TableHeader>
            <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
              <TableHead className='px-6 py-4'>
                <Skeleton className='h-3 w-24 rounded-md' />
              </TableHead>
              <TableHead className='px-6 py-4'>
                <Skeleton className='h-3 w-20 rounded-md' />
              </TableHead>
              <TableHead className='px-6 py-4'>
                <Skeleton className='h-3 w-16 rounded-md' />
              </TableHead>
              <TableHead className='px-6 py-4'>
                <Skeleton className='h-3 w-20 rounded-md' />
              </TableHead>
              <TableHead className='px-6 py-4 text-right'>
                <Skeleton className='ml-auto h-3 w-16 rounded-md' />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, index) => (
              <AdminCourseTableRowSkeleton key={index} />
            ))}
          </TableBody>
        </Table>
      </div>

      <div className='space-y-4 p-4 lg:hidden'>
        {Array.from({ length: Math.min(rows, 4) }).map((_, index) => (
          <AdminCourseMobileCardSkeleton key={index} />
        ))}
      </div>
    </>
  )
}
