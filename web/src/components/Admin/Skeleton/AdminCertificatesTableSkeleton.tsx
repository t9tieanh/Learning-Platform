import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function AdminCertificatesTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className='overflow-x-auto'>
      <Table className='min-w-full'>
        <TableHeader>
          <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
            {Array.from({ length: 6 }).map((_, index) => (
              <TableHead key={index} className='px-6 py-4'>
                <Skeleton className='h-3 w-20 rounded-md' />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className='border-b border-slate-100'>
              <TableCell className='px-6 py-4'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-32 rounded-md' />
                  <Skeleton className='h-3 w-40 rounded-md' />
                </div>
              </TableCell>
              <TableCell className='px-6 py-4'>
                <div className='space-y-2'>
                  <Skeleton className='h-4 w-40 rounded-md' />
                  <Skeleton className='h-3 w-28 rounded-md' />
                </div>
              </TableCell>
              <TableCell className='px-6 py-4'>
                <Skeleton className='h-4 w-24 rounded-md' />
              </TableCell>
              <TableCell className='px-6 py-4'>
                <Skeleton className='h-7 w-20 rounded-full' />
              </TableCell>
              <TableCell className='px-6 py-4'>
                <Skeleton className='h-8 w-28 rounded-full' />
              </TableCell>
              <TableCell className='px-6 py-4 text-right'>
                <div className='flex justify-end gap-2'>
                  <Skeleton className='h-9 w-20 rounded-xl' />
                  <Skeleton className='h-9 w-24 rounded-xl' />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
