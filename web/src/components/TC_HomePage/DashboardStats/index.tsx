import { TrendingUp, Users, BookOpen, Eye } from 'lucide-react'
import { StatsCard } from '../StatsCard'

const DashboardStats = () => {
  return (
    <div className='grid gap-4 mb-6 min-w-0 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
      <StatsCard
        title='Tổng số lớp'
        value='12'
        subtitle='Đang giảng dạy'
        icon={BookOpen}
        variant='primary'
        trend={{ value: '+2', isPositive: true }}
      />
      <StatsCard
        title='Tổng số học viên'
        value='328'
        subtitle='Học viên đang học'
        icon={Users}
        variant='warning'
        trend={{ value: '+15', isPositive: true }}
      />
      <StatsCard
        title='Lợi nhuận tháng này'
        value='47.2M VND'
        subtitle='Doanh thu'
        icon={TrendingUp}
        variant='success'
        trend={{ value: '-8.3%', isPositive: false }}
      />
      <StatsCard
        title='Khách truy cập'
        value='1,247'
        subtitle='Lượt xem profile'
        icon={Eye}
        variant='default'
        trend={{ value: '+12', isPositive: true }}
      />
    </div>
  )
}

export default DashboardStats
