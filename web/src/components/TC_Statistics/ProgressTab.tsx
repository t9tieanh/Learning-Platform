import { Target, CheckCircle, Clock } from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { progressMetrics, funnelData, progressDistribution } from '@/data/mockData'

const FUNNEL_COLORS = ['hsl(238, 65%, 60%)', 'hsl(238, 65%, 50%)', 'hsl(238, 65%, 40%)', 'hsl(152, 60%, 42%)']

const ProgressTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
        <StatCard
          title='Completion Rate'
          value={`${progressMetrics.completionRate}%`}
          icon={Target}
          variant='success'
          trend={{ value: 4.2, positive: true }}
        />
        <StatCard
          title='Completed Students'
          value={progressMetrics.completedStudents}
          icon={CheckCircle}
          trend={{ value: 6.8, positive: true }}
        />
        <StatCard
          title='Avg Completion Time'
          value={progressMetrics.avgCompletionTime}
          icon={Clock}
          subtitle='Average across all courses'
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <ChartContainer title='Student Funnel' subtitle='Enrollment to completion journey'>
          <div className='space-y-3 pt-2'>
            {funnelData.map((item, i) => {
              const widthPct = (item.value / funnelData[0].value) * 100
              return (
                <div key={item.stage} className='flex items-center gap-3'>
                  <span className='text-xs font-medium text-muted-foreground w-20 text-right'>{item.stage}</span>
                  <div className='flex-1 h-9 rounded-lg overflow-hidden bg-muted'>
                    <div
                      className='h-full rounded-lg flex items-center px-3 text-xs font-semibold text-primary-foreground transition-all'
                      style={{ width: `${widthPct}%`, backgroundColor: FUNNEL_COLORS[i] }}
                    >
                      {item.value}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ChartContainer>

        <ChartContainer title='Progress Distribution' subtitle='Where students currently stand'>
          <ResponsiveContainer width='100%' height={240}>
            <BarChart data={progressDistribution}>
              <CartesianGrid strokeDasharray='3 3' stroke='hsl(220, 16%, 90%)' />
              <XAxis dataKey='range' tick={{ fontSize: 11 }} stroke='hsl(220, 10%, 46%)' />
              <YAxis tick={{ fontSize: 11 }} stroke='hsl(220, 10%, 46%)' />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid hsl(220, 16%, 90%)', fontSize: 13 }} />
              <Bar dataKey='students' fill='hsl(152, 60%, 42%)' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

export default ProgressTab
