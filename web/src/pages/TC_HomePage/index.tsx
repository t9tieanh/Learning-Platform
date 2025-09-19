import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'
import DashboardHeader from '@/components/TC_HomePage/DashboardHeader'
import DashboardStats from '@/components/TC_HomePage/DashboardStats'
import ScheduleSection from '@/components/TC_HomePage/ScheduleSection'
import CourseTable from '@/components/TC_HomePage/CourseTable'

const HomePage = () => {
  return (
    <div className='flex min-h-screen bg-background'>
      {/* Sidebar ẩn trên màn hình nhỏ, hiện trên lg */}
      <div className='hidden lg:block'>
        <AcademySidebar />
      </div>
      {/* Sidebar dạng drawer cho mobile */}
      <div className='lg:hidden fixed top-0 left-0 z-40 w-64 h-full bg-[#1D1D2A]'>
        {/* Có thể thêm nút mở/đóng sidebar ở đây nếu muốn */}
        <AcademySidebar />
      </div>

      <div className='flex-1 overflow-auto'>
        <main className='p-4 md:p-8'>
          <DashboardHeader />
          <DashboardStats />

          <div className='grid grid-cols-1 gap-8 lg:grid-cols-2'>
            <ScheduleSection />
            <CourseTable />
          </div>
        </main>
      </div>
    </div>
  )
}

export default HomePage
