import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'
import DashboardHeader from '@/components/TC_HomePage/DashboardHeader'
import DashboardStats from '@/components/TC_HomePage/DashboardStats'
import ScheduleSection from '@/components/TC_HomePage/ScheduleSection'
import CourseTable from '@/components/TC_HomePage/CourseTable'

const HomePage = () => {
  return (
    <div className='flex min-h-screen bg-background'>
      <AcademySidebar />

      <div className='flex-1 overflow-auto'>
        <main className='p-8'>
          <DashboardHeader />
          <DashboardStats />

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
            <ScheduleSection />
            <CourseTable />
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomePage
