import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Users, BookOpen, Eye } from 'lucide-react'
import { StatsCard } from '../StatsCard'

const statsData = [
  {
    title: 'Tổng lớp',
    value: '25',
    change: '+15%',
    color: 'dashboard-success',
    status: true
  },
  {
    title: 'Học sinh',
    value: '163',
    change: '-25%',
    color: 'dashboard-error',
    status: false
  },
  {
    title: 'Lợi nhuận (VND)',
    value: '16.345.000',
    change: '+15%',
    color: 'dashboard-success',
    status: true
  },
  {
    title: 'Khách truy cập',
    value: '2K',
    change: '-35%',
    color: 'dashboard-error',
    status: false
  }
]
const DashboardStats = () => {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6'>
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
        trend={{ value: '-8.2%', isPositive: false }}
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
