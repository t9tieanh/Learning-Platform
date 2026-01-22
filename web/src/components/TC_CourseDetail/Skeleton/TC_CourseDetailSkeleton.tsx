import { CourseHeroSkeleton } from './CourseHeroSkeleton'
import { CourseContentSkeleton } from './CourseContentSkeleton'
import { StatsSidebarSkeleton } from './StatsSidebarSkeleton'

export const TC_CourseDetailSkeleton = () => {
    return (
        <div className='min-h-screen bg-white-200'>
            <main className='container mx-auto px-4 py-8'>
                <div className='grid gap-8 lg:grid-cols-[1fr_320px]'>
                    {/* Left Column */}
                    <div className='space-y-8'>
                        <CourseHeroSkeleton />
                        <CourseContentSkeleton />
                    </div>

                    {/* Right Column */}
                    <aside className='hidden lg:block'>
                        <StatsSidebarSkeleton />
                    </aside>
                </div>
            </main>
        </div>
    )
}
