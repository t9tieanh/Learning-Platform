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

const FUNNEL_COLORS = [
  '#3b82f6', // blue
  '#f59e0b', // amber
  '#10b981' // green
]

const ProgressTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <StatCard
          title='Tỷ lệ hoàn thành'
          value={`${progressMetrics.completionRate}%`}
          icon={Target}
          variant='success'
          trend={{ value: 4.2, positive: true }}
        />
        <StatCard
          title='Số học viên hoàn thành'
          value={progressMetrics.completedStudents}
          icon={CheckCircle}
          trend={{ value: 6.8, positive: true }}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
        <ChartContainer title='Phễu học viên' subtitle='Hành trình từ đăng ký đến hoàn thành'>
          <div className='space-y-3 pt-2'>
            {funnelData.map((item, i) => {
              const widthPct = (item.value / funnelData[0].value) * 100
              return (
                <div key={item.stage} className='flex items-center gap-3'>
                  <span className='w-20 text-right text-xs font-medium text-slate-500'>{item.stage}</span>
                  <div className='h-9 flex-1 overflow-hidden rounded-lg bg-slate-100'>
                    <div
                      className='flex h-full items-center rounded-lg px-3 text-xs font-semibold text-white transition-all'
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

        <ChartContainer title='Phân bố tiến độ' subtitle='Tình trạng hiện tại của học viên'>
          <ResponsiveContainer width='100%' height={240}>
            <BarChart data={progressDistribution}>
              <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
              <XAxis dataKey='range' tick={{ fontSize: 11 }} stroke='#64748b' />
              <YAxis tick={{ fontSize: 11 }} stroke='#64748b' />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 13 }} />
              <Bar dataKey='students' fill='#10b981' radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

export default ProgressTab
