import { DollarSign, TrendingUp, RotateCcw } from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { revenueOverTime, revenueByCourse, revenueMetrics } from '@/data/mockData'

const BAR_COLORS = [
  '#3b82f6', // blue
  '#2f9cf5',
  '#22c55e', // green (middle shift)
  '#1fbf6b',
  '#16a34a',
  '#15803d'
]

const RevenueTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <StatCard
          title='Tổng doanh thu'
          value={`$${revenueMetrics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          variant='success'
          trend={{ value: 18.2, positive: true }}
        />
        <StatCard
          title='Tỷ lệ chuyển đổi'
          value={`${revenueMetrics.conversionRate}%`}
          icon={TrendingUp}
          trend={{ value: 2.1, positive: true }}
        />
      </div>

      <ChartContainer title='Doanh thu theo thời gian' subtitle='Xu hướng doanh thu theo tháng'>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
            <XAxis dataKey='month' tick={{ fontSize: 12 }} stroke='#64748b' />
            <YAxis tick={{ fontSize: 12 }} stroke='#64748b' tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
              formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, 'Doanh thu']}
            />
            <Line
              type='monotone'
              dataKey='revenue'
              stroke='#10b981'
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title='Doanh thu theo khóa học' subtitle='Các khóa học có hiệu suất cao'>
        <ResponsiveContainer width='100%' height={260}>
          <BarChart data={revenueByCourse} layout='vertical'>
            <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
            <XAxis
              type='number'
              tick={{ fontSize: 11 }}
              stroke='#64748b'
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis dataKey='course' type='category' tick={{ fontSize: 11 }} stroke='#64748b' width={120} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }}
              formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, 'Doanh thu']}
            />
            <Bar dataKey='revenue' radius={[0, 6, 6, 0]}>
              {revenueByCourse.map((_, index) => (
                <Cell key={`revenue-cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export default RevenueTab