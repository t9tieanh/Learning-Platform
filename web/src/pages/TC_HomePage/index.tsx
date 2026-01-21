import DashboardHeader from '@/components/TC_HomePage/DashboardHeader'
import DashboardStats from '@/components/TC_HomePage/DashboardStats'
import CourseTable from '@/components/TC_HomePage/CourseTable'

const HomePage = () => {
  return (
    <div className='flex-1 overflow-auto '>
      <main className='p-4 md:p-8 pt-16 lg:pt-8'>
        <DashboardHeader />
        <DashboardStats />
        <CourseTable />
      </main>
    </div>
  )
}

export default HomePage
