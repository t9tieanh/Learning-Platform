import { useEffect, useMemo, useState } from 'react'
import { Users, UserPlus } from 'lucide-react'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { useAuthStore } from '@/stores/useAuth.stores'
import instructorAnalyticsService from '@/services/instructor/instructor-analytics.service'
import type { LearnerAnalytics } from '@/types/instructor-analytics.type'

const monthLabels = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']

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
  const userId = useAuthStore((s) => s.data?.userId)
  const [year] = useState<number>(new Date().getFullYear())
  const [data, setData] = useState<LearnerAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    let mounted = true
    setLoading(true)
    setError(null)

    instructorAnalyticsService
      .getLearnerAnalytics({ instructorId: userId, year })
      .then((res) => {
        if (mounted) setData(res)
      })
      .catch((e) => {
        if (mounted) setError(e?.message || 'Không lấy được dữ liệu học viên')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [userId, year])

  const chartData = useMemo(
    () =>
      (data?.monthlyStudents ?? []).map((item) => ({
        date: monthLabels[item.month - 1] ?? String(item.month),
        students: item.studentCount
      })),
    [data]
  )

  if (loading) {
    return (
      <div className='space-y-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
          <div className='h-[168px] animate-pulse rounded-[28px] bg-slate-100' />
          <div className='h-[168px] animate-pulse rounded-[28px] bg-slate-100' />
        </div>
        <div className='h-[360px] animate-pulse rounded-[28px] bg-slate-100' />
      </div>
    )
  }

  if (error) {
    return <div className='rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>{error}</div>
  }

  const isEmpty = !data || data.monthlyStudents.every((m) => m.studentCount === 0)

  return (
    <div className='space-y-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        <StatCard
          title='Học viên ghi danh trong năm'
          value={(data?.totalStudentsInYear ?? 0).toLocaleString()}
          icon={Users}
          variant='primary'
        />
        <StatCard
          title='Học viên ghi danh mới'
          value={(data?.newStudentsCurrentMonth ?? 0).toLocaleString()}
          icon={UserPlus}
          variant='success'
          trend={{
            value: Math.abs(data?.newStudentsTrendPercent ?? 0),
            positive: (data?.newStudentsTrendPercent ?? 0) >= 0
          }}
        />
      </div>

      <ChartContainer title='Tăng trưởng học viên' subtitle='Số lượng đăng ký theo từng tháng trong năm'>
        {isEmpty ? (
          <div className='flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500'>
            Chưa có dữ liệu học viên trong năm này
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <AreaChart data={chartData}>
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
        )}
      </ChartContainer>
    </div>
  )
}

export default AnalyticsTab
