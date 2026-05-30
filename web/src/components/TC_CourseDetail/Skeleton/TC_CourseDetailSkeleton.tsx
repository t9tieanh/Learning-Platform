import { CourseHeroSkeleton } from './CourseHeroSkeleton'
import { CourseContentSkeleton } from './CourseContentSkeleton'
import { StatsSidebarSkeleton } from './StatsSidebarSkeleton'

export const TC_CourseDetailSkeleton = () => {
  return (
    <div className='min-h-[100dvh]'>
      <main className='mx-auto w-full max-w-[1400px] px-0 py-0'>
        <div className='grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]'>
          <div className='space-y-8'>
            <CourseHeroSkeleton />
            <CourseContentSkeleton />
          </div>

          <aside className='hidden lg:block'>
            <StatsSidebarSkeleton />
          </aside>
        </div>
      </main>
    </div>
  )
}
