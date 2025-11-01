import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'
import DashboardHeader from '@/components/TC_HomePage/DashboardHeader'
import DashboardStats from '@/components/TC_HomePage/DashboardStats'
import CourseTable from '@/components/TC_HomePage/CourseTable'

const HomePage = () => {
  return (
    <div className='flex min-h-screen bg-background'>
      <div className='fixed top-0 left-0 h-screen w-64 bg-[#1D1D2A]'>
        <AcademySidebar />
      </div>

      <div className='flex-1 overflow-auto '>
        <main className='p-4 md:p-8'>
          <DashboardHeader />
          <DashboardStats />
          <CourseTable />
        </main>
      </div>
    </div>
  )
}

export default HomePage
