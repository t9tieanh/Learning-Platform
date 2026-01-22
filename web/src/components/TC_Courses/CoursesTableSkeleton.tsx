import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const CoursesTableSkeleton = () => {
    return (
        <div className='overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm'>
            <Table className='min-w-[700px]'>
                <TableHeader>
                    <TableRow className='bg-blue-100 dark:bg-slate-800'>
                        <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>
                            <Skeleton className='h-4 w-24 bg-blue-200' />
                        </TableHead>
                        <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>
                            <div className='flex items-center gap-2'>
                                <Skeleton className='h-4 w-20 bg-blue-200' />
                                <Skeleton className='h-6 w-6 rounded-md bg-white' />
                            </div>
                        </TableHead>
                        <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>
                            <Skeleton className='h-4 w-20 bg-blue-200' />
                        </TableHead>
                        <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>
                            <Skeleton className='h-4 w-20 bg-blue-200' />
                        </TableHead>
                        <TableHead />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <TableRow key={i} className='hover:bg-white dark:hover:bg-slate-800'>
                            <TableCell className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                                <Skeleton className='w-20 h-14 sm:w-28 sm:h-20 rounded-lg bg-gray-200' />
                                <div className='space-y-2'>
                                    <Skeleton className='h-5 w-48 bg-gray-300' />
                                    <Skeleton className='h-4 w-64 bg-gray-200' />
                                    <div className='flex gap-2 mt-2'>
                                        <Skeleton className='h-4 w-16 rounded-full bg-indigo-50' />
                                        <Skeleton className='h-4 w-16 rounded-full bg-indigo-50' />
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className='px-4'>
                                <Skeleton className='h-6 w-24 rounded-full bg-gray-200' />
                            </TableCell>
                            <TableCell className='text-gray-700 dark:text-gray-300'>
                                <Skeleton className='h-4 w-16 bg-gray-200' />
                            </TableCell>
                            <TableCell className='text-gray-500 dark:text-gray-400 px-5'>
                                <Skeleton className='h-4 w-24 bg-gray-200' />
                            </TableCell>
                            <TableCell className='text-right'>
                                <Skeleton className='h-8 w-8 rounded-full bg-gray-100 ml-auto' />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}

export default CoursesTableSkeleton
