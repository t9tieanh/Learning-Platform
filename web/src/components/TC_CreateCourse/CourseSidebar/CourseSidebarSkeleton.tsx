import { Skeleton } from '@/components/ui/skeleton'

const CourseSidebarSkeleton = () => {
  return (
    <aside
      className='md:w-80 w-full h-full min-h-0 bg-[#1D1D2A] border-r border-gray-800 overflow-y-auto flex flex-col'
      aria-hidden
    >
      <div className='p-6 flex-1 flex flex-col min-h-0'>
        <div className='mb-8 space-y-4 shrink-0'>
          <Skeleton className='h-9 w-28 rounded-md bg-gray-700/90' />
          <div className='flex items-center gap-2'>
            <Skeleton className='h-7 w-7 rounded-lg bg-gray-700' />
            <Skeleton className='h-4 w-40 max-w-[85%] bg-gray-600' />
          </div>
        </div>

        <div className='space-y-2 flex-1'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className='p-4 rounded-[24px] bg-gray-800/40 border border-gray-800/90'
            >
              <div className='flex gap-4 items-center'>
                <Skeleton className='h-10 w-10 rounded-xl shrink-0 bg-gray-600' />
                <div className='flex-1 min-w-0 pt-0.5'>
                  <Skeleton className='h-3.5 w-[70%] max-w-[10rem] bg-gray-600' />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className='pt-4 mt-4 shrink-0 border-t border-gray-800'>
          <div className='p-4 rounded-[20px] bg-gray-900/35 border border-gray-800/80'>
            <div className='flex gap-4 items-center'>
              <Skeleton className='h-10 w-10 rounded-xl shrink-0 bg-red-900/30' />
              <Skeleton className='h-3.5 w-24 bg-gray-600' />
            </div>
          </div>
        </div>
      </div>
    </aside>
  )
}

export default CourseSidebarSkeleton
