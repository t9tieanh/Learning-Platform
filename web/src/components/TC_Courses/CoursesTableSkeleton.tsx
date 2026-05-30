import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const CoursesTableSkeleton = () => {
  return (
    <div className='h-[720px] overflow-auto rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-[0_16px_42px_rgba(15,23,42,0.08)]'>
      <Table className='min-w-[860px]'>
        <TableHeader>
          <TableRow className='border-b border-slate-200 bg-slate-50/75 hover:bg-slate-50/75'>
            <TableHead className='p-5'>
              <Skeleton className='h-3.5 w-28 bg-slate-200' />
            </TableHead>
            <TableHead className='p-5'>
              <div className='flex items-center gap-2'>
                <Skeleton className='h-3.5 w-20 bg-slate-200' />
                <Skeleton className='h-6 w-6 rounded-lg bg-slate-200' />
              </div>
            </TableHead>
            <TableHead className='p-5'>
              <Skeleton className='h-3.5 w-16 bg-slate-200' />
            </TableHead>
            <TableHead className='p-5'>
              <Skeleton className='h-3.5 w-16 bg-slate-200' />
            </TableHead>
            <TableHead className='p-5' />
          </TableRow>
        </TableHeader>

        <TableBody>
          {[1, 2, 3, 4, 5].map((i) => (
            <TableRow key={i} className='border-b border-slate-100 last:border-0'>
              <TableCell className='p-5'>
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-16 w-24 rounded-xl bg-slate-200' />
                  <div className='space-y-2'>
                    <Skeleton className='h-4 w-48 bg-slate-200' />
                    <div className='flex gap-2'>
                      <Skeleton className='h-4 w-16 rounded-md bg-slate-200' />
                      <Skeleton className='h-4 w-16 rounded-md bg-slate-200' />
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className='p-5'>
                <Skeleton className='h-6 w-24 rounded-full bg-slate-200' />
              </TableCell>
              <TableCell className='p-5'>
                <Skeleton className='h-4 w-16 bg-slate-200' />
              </TableCell>
              <TableCell className='p-5'>
                <Skeleton className='h-4 w-24 bg-slate-200' />
              </TableCell>
              <TableCell className='p-5 text-right'>
                <Skeleton className='ml-auto h-8 w-8 rounded-xl bg-slate-200' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default CoursesTableSkeleton
