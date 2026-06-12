import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function AdminInstructorsTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className='overflow-x-auto'>
      <Table className='min-w-[820px]'>
        <TableHeader>
          <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
            <TableHead className='px-6 py-4'>
              <Skeleton className='h-3 w-20 rounded-md' />
            </TableHead>
            <TableHead className='px-6 py-4'>
              <Skeleton className='h-3 w-12 rounded-md' />
            </TableHead>
            <TableHead className='px-6 py-4'>
              <Skeleton className='h-3 w-24 rounded-md' />
            </TableHead>
            <TableHead className='px-6 py-4 text-right'>
              <Skeleton className='ml-auto h-3 w-16 rounded-md' />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className='border-b border-slate-100'>
              <TableCell className='px-6 py-4'>
                <div className='flex items-center gap-4'>
                  <Skeleton className='h-12 w-12 rounded-full' />
                  <Skeleton className='h-4 w-36 rounded-md' />
                </div>
              </TableCell>
              <TableCell className='px-6 py-4'>
                <Skeleton className='h-4 w-44 rounded-md' />
              </TableCell>
              <TableCell className='px-6 py-4'>
                <Skeleton className='h-4 w-16 rounded-md' />
              </TableCell>
              <TableCell className='px-6 py-4 text-right'>
                <Skeleton className='ml-auto h-9 w-32 rounded-full' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
