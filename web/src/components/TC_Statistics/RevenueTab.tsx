import { DollarSign, RotateCcw, TrendingUp } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { revenueByCourse, revenueMetrics, revenueOverTime } from '@/data/mockData'

const BAR_COLORS = ['#0f766e', '#0d9488', '#14b8a6', '#22c55e', '#84cc16', '#f59e0b']

const tooltipStyle = {
  borderRadius: 16,
  border: '1px solid #dbeafe',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  boxShadow: '0 18px 36px -24px rgba(15, 23, 42, 0.35)',
  padding: '10px 12px',
  fontSize: 13
}

const RevenueTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1.2fr_0.9fr]'>
        <StatCard
          title='Tổng doanh thu'
          value={`$${revenueMetrics.totalRevenue.toLocaleString()}`}
          subtitle='Doanh thu tích lũy từ toàn bộ khóa học trong hệ thống.'
          icon={DollarSign}
          variant='success'
          trend={{ value: 18.2, positive: true }}
        />
        <StatCard
          title='Tỷ lệ chuyển đổi'
          value={`${revenueMetrics.conversionRate}%`}
          subtitle='Tỷ lệ học viên chuyển từ quan tâm sang thanh toán thành công.'
          icon={TrendingUp}
          variant='primary'
          trend={{ value: 2.1, positive: true }}
        />
        <StatCard
          title='Tỷ lệ hoàn tiền'
          value={`${revenueMetrics.refundRate}%`}
          subtitle='Mức hoàn tiền đang được giữ ở vùng an toàn và ổn định.'
          icon={RotateCcw}
          variant='warning'
          trend={{ value: 0.4, positive: false }}
        />
      </div>

      <ChartContainer title='Doanh thu theo thời gian' subtitle='Hiệu suất doanh thu hàng tháng trong năm gần nhất'>
        <div className='mb-6 flex flex-wrap gap-3'>
          <div className='rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700'>Tăng trưởng</p>
            <p className='mt-1 text-lg font-semibold text-emerald-950'>+18.2%</p>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>Tháng cao nhất</p>
            <p className='mt-1 text-lg font-semibold text-slate-950'>$28.3k</p>
          </div>
        </div>

        <ResponsiveContainer width='100%' height={320}>
          <LineChart data={revenueOverTime} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              <linearGradient id='revenueLine' x1='0' y1='0' x2='1' y2='0'>
                <stop offset='0%' stopColor='#14b8a6' />
                <stop offset='100%' stopColor='#38bdf8' />
              </linearGradient>
              <linearGradient id='revenueArea' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#14b8a6' stopOpacity={0.18} />
                <stop offset='100%' stopColor='#14b8a6' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray='3 3' stroke='#e2e8f0' />
            <XAxis dataKey='month' axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={8} />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              cursor={{ stroke: '#99f6e4', strokeDasharray: '4 4' }}
              contentStyle={tooltipStyle}
              formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, 'Doanh thu']}
              labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: 6 }}
            />
            <Line
              type='monotone'
              dataKey='revenue'
              stroke='url(#revenueLine)'
              strokeWidth={3}
              dot={{ r: 0 }}
              activeDot={{ r: 5, fill: '#14b8a6', stroke: '#ffffff', strokeWidth: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title='Doanh thu theo khóa học' subtitle='So sánh các khóa học tạo doanh thu tốt nhất'>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={revenueByCourse} layout='vertical' margin={{ top: 4, right: 12, left: 12, bottom: 4 }}>
            <CartesianGrid horizontal strokeDasharray='3 3' stroke='#eef2f7' />
            <XAxis
              type='number'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              stroke='#64748b'
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              dataKey='course'
              type='category'
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#334155' }}
              stroke='#64748b'
              width={124}
            />
            <Tooltip
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
              contentStyle={tooltipStyle}
              formatter={(v) => [`$${Number(v ?? 0).toLocaleString()}`, 'Doanh thu']}
              labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: 6 }}
            />
            <Bar dataKey='revenue' radius={[0, 12, 12, 0]} barSize={28}>
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
