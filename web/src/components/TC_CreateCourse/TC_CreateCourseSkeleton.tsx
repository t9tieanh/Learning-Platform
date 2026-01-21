import TC_CourseSidebarSkeleton from './CourseSidebar/CourseSidebarSkeleton'
import TC_CourseContentSkeleton from './LandingPageForm/Skeleton/LandingPageFormSkeleton'

const TC_CreateCourseSkeleton = () => {
    return (
        <div className='h-screen bg-background'>
            <div className='flex h-screen'>
                <TC_CourseSidebarSkeleton />
                <main className='flex-1 p-8 min-h-screen overflow-auto'>
                    <TC_CourseContentSkeleton />
                </main>
            </div>
        </div>
    )
}

export default TC_CreateCourseSkeleton
