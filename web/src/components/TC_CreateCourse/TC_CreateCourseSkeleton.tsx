import TC_CourseSidebarSkeleton from './CourseSidebar/CourseSidebarSkeleton'
import TC_CourseContentSkeleton from './LandingPageForm/Skeleton/LandingPageFormSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

const TC_CreateCourseSkeleton = () => {
  return (
    <div className='fixed inset-0 z-50 bg-background flex flex-col overflow-hidden'>
      <div className='lg:hidden p-4 border-b border-gray-200 flex items-center gap-4 bg-white dark:bg-slate-900 z-20 shrink-0'>
        <Skeleton className='h-10 w-10 rounded-md shrink-0' />
        <Skeleton className='h-5 w-40 max-w-[50%]' />
      </div>

      <div className='flex flex-1 overflow-hidden min-h-0'>
        <div className='hidden lg:block h-full min-h-0 shrink-0'>
          <TC_CourseSidebarSkeleton />
        </div>

        <main className='flex-1 p-4 md:p-6 lg:p-8 overflow-auto flex flex-col min-w-0 w-full'>
          <div className='flex-1 w-full min-w-0'>
            <TC_CourseContentSkeleton />
          </div>
          <div className='max-w-7xl mx-auto flex justify-between items-center mt-5 pb-10 w-full px-0 gap-4 shrink-0'>
            <Skeleton className='h-10 w-[7.5rem] rounded-lg' />
            <Skeleton className='h-10 w-[7.5rem] rounded-lg' />
          </div>
        </main>
      </div>
    </div>
  )
}

export default TC_CreateCourseSkeleton
