import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

export const StatsSidebarSkeleton = () => {
    return (
        <div className='space-y-6 sticky top-6'>
            <div className='rounded-xl p-6 shadow-md bg-white dark:bg-slate-900'>
                <Skeleton className='h-6 w-32 mb-6' />

                <div className='space-y-4'>
                    {[1, 2, 3].map((i) => (
                        <div key={i}>
                            <div className='flex items-center gap-3 py-2'>
                                <Skeleton className='h-10 w-10 rounded-lg' />
                                <div className='space-y-2'>
                                    <Skeleton className='h-3 w-16' />
                                    <Skeleton className='h-5 w-24' />
                                </div>
                            </div>
                            {i < 3 && <Separator className='my-2' />}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
