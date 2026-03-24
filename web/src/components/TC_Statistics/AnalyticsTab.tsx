import { Users, UserPlus, UserCheck } from 'lucide-react'
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
  PieChart,
  Pie,
  Cell
} from 'recharts'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { studentsOverTime, studentsByCountry, studentsByAge, trafficSource, userMetrics } from '@/data/mockData'

const PIE_COLORS = ['hsl(238, 65%, 60%)', 'hsl(199, 89%, 48%)', 'hsl(38, 92%, 50%)']

const AnalyticsTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          title='Total Students'
          value={userMetrics.totalStudents.toLocaleString()}
          icon={Users}
          variant='primary'
          trend={{ value: 12.5, positive: true }}
        />
        <StatCard
          title='New Students'
          value={userMetrics.newStudents}
          icon={UserPlus}
          trend={{ value: 8.3, positive: true }}
        />
        <StatCard
          title='Returning Students'
          value={userMetrics.returningStudents}
          icon={UserCheck}
          trend={{ value: 3.1, positive: true }}
        />
      </div>

      <ChartContainer title='Students Over Time' subtitle='Monthly enrollment growth'>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={studentsOverTime}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 16%, 90%)' />
            <XAxis dataKey='date' tick={{ fontSize: 12 }} stroke='hsl(220, 10%, 46%)' />
            <YAxis tick={{ fontSize: 12 }} stroke='hsl(220, 10%, 46%)' />
            <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(220, 16%, 90%)', fontSize: 13 }} />
            <Line
              type='monotone'
              dataKey='students'
              stroke='hsl(238, 65%, 60%)'
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'hsl(238, 65%, 60%)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <ChartContainer title='Students by Country'>
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={studentsByCountry} layout='vertical'>
              <CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 16%, 90%)' />
              <XAxis type='number' tick={{ fontSize: 11 }} stroke='hsl(220, 10%, 46%)' />
              <YAxis dataKey='country' type='category' tick={{ fontSize: 11 }} stroke='hsl(220, 10%, 46%)' width={60} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(220, 16%, 90%)', fontSize: 13 }} />
              <Bar dataKey='students' fill='hsl(238, 65%, 60%)' radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title='Students by Age Group'>
          <ResponsiveContainer width='100%' height={220}>
            <BarChart data={studentsByAge}>
              <CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 16%, 90%)' />
              <XAxis dataKey='age' tick={{ fontSize: 11 }} stroke='hsl(220, 10%, 46%)' />
              <YAxis tick={{ fontSize: 11 }} stroke='hsl(220, 10%, 46%)' />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(220, 16%, 90%)', fontSize: 13 }} />
              <Bar dataKey='students' fill='hsl(199, 89%, 48%)' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>

        <ChartContainer title='Traffic Source'>
          <ResponsiveContainer width='100%' height={220}>
            <PieChart>
              <Pie
                data={trafficSource}
                cx='50%'
                cy='50%'
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey='value'
                label={({ name, value }) => `${name} ${value}%`}
                labelLine={false}
              >
                {trafficSource.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

export default AnalyticsTab
