import { CheckCircle, Clock, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { funnelData, progressDistribution, progressMetrics } from '@/data/mockData'

const FUNNEL_COLORS = ['#0ea5e9', '#14b8a6', '#22c55e']

const tooltipStyle = {
  borderRadius: 16,
  border: '1px solid #dbeafe',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  boxShadow: '0 18px 36px -24px rgba(15, 23, 42, 0.35)',
  padding: '10px 12px',
  fontSize: 13
}

const ProgressTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_1.2fr_0.9fr]'>
        <StatCard
          title='Tỷ lệ hoàn thành'
          value={`${progressMetrics.completionRate}%`}
          subtitle='Tỷ lệ học viên đã hoàn tất đầy đủ chương trình học.'
          icon={Target}
          variant='success'
          trend={{ value: 4.2, positive: true }}
        />
        <StatCard
          title='Số học viên hoàn thành'
          value={progressMetrics.completedStudents}
          subtitle='Số lượng học viên đã đi đến cuối hành trình khóa học.'
          icon={CheckCircle}
          variant='primary'
          trend={{ value: 6.8, positive: true }}
        />
        <StatCard
          title='Thời gian hoàn thành'
          value={progressMetrics.avgCompletionTime}
          subtitle='Thời gian trung bình để học viên hoàn tất toàn bộ nội dung.'
          icon={Clock}
          variant='warning'
        />
      </div>

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_1.2fr]'>
        <ChartContainer title='Phễu học viên' subtitle='Hành trình từ đăng ký đến hoàn thành khóa học'>
          <div className='space-y-4'>
            {funnelData.map((item, i) => {
              const widthPct = (item.value / funnelData[0].value) * 100
              return (
                <div key={item.stage} className='rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4'>
                  <div className='mb-3 flex items-center justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      <span
                        className='inline-flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold text-white shadow-sm'
                        style={{ backgroundColor: FUNNEL_COLORS[i] }}
                      >
                        {i + 1}
                      </span>
                      <div>
                        <p className='text-sm font-semibold text-slate-900'>{item.stage}</p>
                        <p className='text-xs text-slate-500'>Giai đoạn {i + 1} trong hành trình học viên</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <p className='text-lg font-semibold text-slate-950'>{item.value}</p>
                      <p className='text-xs text-slate-500'>{Math.round(widthPct)}% tổng số</p>
                    </div>
                  </div>

                  <div className='h-3 overflow-hidden rounded-full bg-slate-200/70'>
                    <div
                      className='h-full rounded-full transition-all duration-500'
                      style={{
                        width: `${widthPct}%`,
                        background: `linear-gradient(90deg, ${FUNNEL_COLORS[i]} 0%, ${FUNNEL_COLORS[i]}CC 100%)`
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </ChartContainer>

        <ChartContainer title='Phân bố tiến độ' subtitle='Phân nhóm học viên theo mức độ hoàn thành hiện tại'>
          <div className='mb-5 flex flex-wrap gap-3'>
            <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>Nhóm dẫn đầu</p>
              <p className='mt-1 text-lg font-semibold text-slate-950'>75-100%</p>
            </div>
            <div className='rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3'>
              <p className='text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700'>Động lực học tập</p>
              <p className='mt-1 text-lg font-semibold text-emerald-950'>425 học viên</p>
            </div>
          </div>

          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={progressDistribution} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id='progressBar' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='0%' stopColor='#0ea5e9' />
                  <stop offset='100%' stopColor='#22c55e' />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' stroke='#e2e8f0' />
              <XAxis
                dataKey='range'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                dy={8}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                contentStyle={tooltipStyle}
                formatter={(value) => [value, 'Học viên']}
                labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: 6 }}
              />
              <Bar dataKey='students' fill='url(#progressBar)' radius={[12, 12, 0, 0]} barSize={46} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
    </div>
  )
}

export default ProgressTab
