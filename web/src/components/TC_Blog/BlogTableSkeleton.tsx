import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const BlogTableSkeleton = ({ rows = 6 }: { rows?: number }) => {
  return (
    <div className='overflow-x-auto'>
      <Table className='min-w-[760px]'>
        <TableHeader>
          <TableRow className='border-b border-slate-200 bg-slate-50/70 hover:bg-slate-50/70'>
            <TableHead className='px-4 py-4 sm:px-6'>
              <Skeleton className='h-3 w-24 rounded-md' />
            </TableHead>
            <TableHead className='px-4 py-4 sm:px-6'>
              <Skeleton className='h-3 w-20 rounded-md' />
            </TableHead>
            <TableHead className='px-4 py-4 sm:px-6 text-right'>
              <Skeleton className='ml-auto h-3 w-16 rounded-md' />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: rows }).map((_, index) => (
            <TableRow key={index} className='border-b border-slate-100'>
              <TableCell className='px-4 py-4 sm:px-6'>
                <div className='flex items-center gap-3 sm:gap-4'>
                  <Skeleton className='h-14 w-20 rounded-lg sm:h-20 sm:w-28' />
                  <div className='min-w-0 flex-1 space-y-2'>
                    <Skeleton className='h-5 w-48 max-w-full rounded-md' />
                    <Skeleton className='h-4 w-64 max-w-full rounded-md' />
                  </div>
                </div>
              </TableCell>
              <TableCell className='px-4 py-4 sm:px-6'>
                <Skeleton className='h-4 w-24 rounded-md' />
              </TableCell>
              <TableCell className='px-4 py-4 text-right sm:px-6'>
                <Skeleton className='ml-auto h-8 w-8 rounded-full' />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default BlogTableSkeleton
