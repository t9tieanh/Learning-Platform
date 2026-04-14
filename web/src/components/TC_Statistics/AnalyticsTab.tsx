import { Users, UserPlus } from 'lucide-react'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { studentsOverTime, studentsByCountry, studentsByAge, trafficSource, userMetrics } from '@/data/mockData'

const PIE_COLORS = [
  '#3b82f6', // blue
  '#22c55e', // green
  '#f59e0b', // amber
  '#ef4444' // red
]

const BAR_COLORS = [
  '#3b82f6', // blue
  '#4f6df3',
  '#6366f1', // indigo
  '#7c5cf0',
  '#8b5cf6', // violet
  '#a855f7' // purple
]
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className='rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-xl'>
      <p className='mb-1 text-xs font-medium text-slate-500'>{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className='text-sm font-bold' style={{ color: entry.color }}>
          {entry.value.toLocaleString()} học viên
        </p>
      ))}
    </div>
  )
}

const AnalyticsTab = () => {
  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        <StatCard
          title='Tổng học viên'
          value={userMetrics.totalStudents.toLocaleString()}
          icon={Users}
          variant='primary'
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          title='Học viên mới'
          value={userMetrics.newStudents.toLocaleString()}
          icon={UserPlus}
          variant='success'
          trend={{ value: 8.3, positive: true }}
        />
      </div>

      <ChartContainer title='Tăng trưởng học viên' subtitle='Số lượng đăng ký theo từng tháng trong năm'>
        <ResponsiveContainer width='100%' height={300}>
          <AreaChart data={studentsOverTime}>
            <defs>
              <linearGradient id='studentGradient' x1='0' y1='0' x2='0' y2='1'>
                <stop offset='0%' stopColor='#3b82f6' stopOpacity={0.2} />
                <stop offset='100%' stopColor='#3b82f6' stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} />
            <XAxis dataKey='date' tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type='monotone'
              dataKey='students'
              stroke='#3b82f6'
              strokeWidth={2.5}
              fill='url(#studentGradient)'
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#ffffff' }}
              activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 3, stroke: '#ffffff' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-5'>
        <ChartContainer title='🌍 Theo quốc gia' subtitle='Phân bố học viên theo khu vực'>
          <ResponsiveContainer width='100%' height={240}>
            <BarChart data={studentsByCountry} layout='vertical' barCategoryGap='20%'>
              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' horizontal={false} />

              <XAxis type='number' tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />

              <YAxis
                dataKey='country'
                type='category'
                tick={{ fontSize: 11, fill: '#64748b' }}
                width={60}
                axisLine={false}
                tickLine={false}
              />

              <Tooltip content={<CustomTooltip />} />

              <Bar dataKey='students' radius={[0, 8, 8, 0]}>
                {studentsByCountry.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title='👥 Theo độ tuổi' subtitle='Nhóm tuổi của học viên'>
          <ResponsiveContainer width='100%' height={240}>
            <BarChart data={studentsByAge} barCategoryGap='25%'>
              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} />
              <XAxis dataKey='age' tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey='students' fill='#3b82f6' radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title='📊 Nguồn truy cập' subtitle='Kênh tiếp cận học viên'>
          <div className='flex flex-col items-center'>
            <ResponsiveContainer width='100%' height={180}>
              <PieChart>
                <Pie
                  data={trafficSource}
                  cx='50%'
                  cy='50%'
                  innerRadius={48}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey='value'
                  strokeWidth={0}
                >
                  {trafficSource.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [`${value ?? 0}%`, '']}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    fontSize: 13,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className='flex items-center gap-5 mt-2'>
              {trafficSource.map((item, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <span className='inline-block h-2.5 w-2.5 rounded-full' style={{ backgroundColor: PIE_COLORS[i] }} />
                  <span className='text-xs font-medium text-slate-500'>
                    {item.name} <span className='font-bold text-slate-900'>{item.value}%</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </ChartContainer>
      </div>
    </div>
  )
}

export default AnalyticsTab
