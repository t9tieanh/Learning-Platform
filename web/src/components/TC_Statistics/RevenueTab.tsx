import { DollarSign, TrendingUp, RotateCcw } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { revenueOverTime, revenueByCourse, revenueMetrics } from '@/data/mockData'

const RevenueTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          title='Total Revenue'
          value={`$${revenueMetrics.totalRevenue.toLocaleString()}`}
          icon={DollarSign}
          variant='success'
          trend={{ value: 18.2, positive: true }}
        />
        <StatCard
          title='Conversion Rate'
          value={`${revenueMetrics.conversionRate}%`}
          icon={TrendingUp}
          trend={{ value: 2.1, positive: true }}
        />
        <StatCard
          title='Refund Rate'
          value={`${revenueMetrics.refundRate}%`}
          icon={RotateCcw}
          variant='warning'
          trend={{ value: 0.3, positive: false }}
        />
      </div>

      <ChartContainer title='Revenue Over Time' subtitle='Monthly revenue trend'>
        <ResponsiveContainer width='100%' height={280}>
          <LineChart data={revenueOverTime}>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 16%, 90%)' />
            <XAxis dataKey='month' tick={{ fontSize: 12 }} stroke='hsl(220, 10%, 46%)' />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke='hsl(220, 10%, 46%)'
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid hsl(220, 16%, 90%)', fontSize: 13 }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
            />
            <Line
              type='monotone'
              dataKey='revenue'
              stroke='hsl(152, 60%, 42%)'
              strokeWidth={2.5}
              dot={{ r: 3, fill: 'hsl(152, 60%, 42%)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>

      <ChartContainer title='Revenue by Course' subtitle='Top performing courses'>
        <ResponsiveContainer width='100%' height={260}>
          <BarChart data={revenueByCourse} layout='vertical'>
            <CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 16%, 90%)' />
            <XAxis
              type='number'
              tick={{ fontSize: 11 }}
              stroke='hsl(220, 10%, 46%)'
              tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            />
            <YAxis dataKey='course' type='category' tick={{ fontSize: 11 }} stroke='hsl(220, 10%, 46%)' width={120} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: '1px solid hsl(220, 16%, 90%)', fontSize: 13 }}
              formatter={(v: number) => [`$${v.toLocaleString()}`, 'Revenue']}
            />
            <Bar dataKey='revenue' fill='hsl(238, 65%, 60%)' radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  )
}

export default RevenueTab
