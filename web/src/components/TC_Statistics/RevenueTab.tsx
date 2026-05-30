import { useEffect, useMemo, useState } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
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
import { useAuthStore } from '@/stores/useAuth.stores'
import instructorRevenueAnalyticsService from '@/services/instructor/instructor-revenue-analytics.service'
import type { RevenueAnalytics } from '@/types/instructor-revenue-analytics.type'

const BAR_COLORS = ['#0f766e', '#0d9488', '#14b8a6', '#22c55e', '#84cc16', '#f59e0b']

const tooltipStyle = {
  borderRadius: 16,
  border: '1px solid #dbeafe',
  backgroundColor: 'rgba(255, 255, 255, 0.96)',
  boxShadow: '0 18px 36px -24px rgba(15, 23, 42, 0.35)',
  padding: '10px 12px',
  fontSize: 13
}

const monthLabels = ['Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12']

const formatVndCompact = (value: number) =>
  new Intl.NumberFormat('vi-VN', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  }).format(value)

const formatVndFull = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} đ`

const RevenueTab = () => {
  const userId = useAuthStore((s) => s.data?.userId)
  const [year] = useState<number>(new Date().getFullYear())
  const [data, setData] = useState<RevenueAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) return

    let mounted = true
    setLoading(true)
    setError(null)

    instructorRevenueAnalyticsService
      .getRevenueAnalytics({ instructorId: userId, year })
      .then((res) => {
        if (mounted) setData(res)
      })
      .catch((e) => {
        if (!mounted) return
        const status = e?.response?.status

        // Backend trả 400 khi chưa có dữ liệu thống kê cho năm hiện tại.
        // Khi đó hiển thị state rỗng thay vì lỗi kỹ thuật.
        if (status === 400) {
          setData(null)
          setError(null)
          return
        }

        setError(e?.message || 'Không lấy được dữ liệu doanh thu')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    return () => {
      mounted = false
    }
  }, [userId, year])

  const revenueOverTime = useMemo(
    () =>
      (data?.monthlyRevenue ?? []).map((m) => ({
        month: monthLabels[m.month - 1] ?? String(m.month),
        revenue: Number(m.revenue) || 0
      })),
    [data]
  )

  const revenueByCourse = useMemo(
    () =>
      (data?.topCoursesByRevenue ?? []).map((c) => ({
        course: c.courseTitle,
        revenue: Number(c.revenue) || 0
      })),
    [data]
  )

  const isEmpty =
    !data ||
    (((data?.monthlyRevenue ?? []).every((m) => Number(m.revenue) === 0) &&
      (data?.topCoursesByRevenue ?? []).length === 0))

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
          <div className='h-[186px] animate-pulse rounded-[28px] bg-slate-100' />
          <div className='h-[186px] animate-pulse rounded-[28px] bg-slate-100' />
        </div>
        <div className='h-[420px] animate-pulse rounded-[28px] bg-slate-100' />
        <div className='h-[360px] animate-pulse rounded-[28px] bg-slate-100' />
      </div>
    )
  }

  if (error) {
    return <div className='rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700'>{error}</div>
  }

  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 lg:grid-cols-2'>
        <StatCard
          title='Tổng doanh thu'
          value={formatVndCompact(data?.totalRevenueInYear ?? 0)}
          subtitle='Doanh thu tích lũy trong năm hiện tại từ các đơn hoàn tất.'
          icon={DollarSign}
          variant='success'
          trend={{ value: Math.abs(data?.revenueTrendPercent ?? 0), positive: (data?.revenueTrendPercent ?? 0) >= 0 }}
          trendLabel='MTD so với tháng trước'
        />
        <StatCard
          title='Lợi nhuận'
          value={formatVndCompact(data?.totalProfitInYear ?? 0)}
          subtitle='Lợi nhuận tích lũy trong năm hiện tại từ các đơn hoàn tất.'
          icon={TrendingUp}
          variant='primary'
          trend={{ value: Math.abs(data?.profitTrendPercent ?? 0), positive: (data?.profitTrendPercent ?? 0) >= 0 }}
          trendLabel='MTD so với tháng trước'
        />
      </div>

      <ChartContainer title='Doanh thu theo thời gian' subtitle='Hiệu suất doanh thu hàng tháng trong năm hiện tại'>
        <div className='mb-6 flex flex-wrap gap-3'>
          <div className='rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700'>Tăng trưởng</p>
            <p className='mt-1 text-lg font-semibold text-emerald-950'>{`${(data?.revenueTrendPercent ?? 0).toFixed(
              2
            )}%`}</p>
          </div>
          <div className='rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3'>
            <p className='text-xs font-semibold uppercase tracking-[0.18em] text-slate-500'>Tháng cao nhất</p>
            <p className='mt-1 text-lg font-semibold text-slate-950'>
              {`${formatVndCompact(data?.highestRevenueMonth?.revenue ?? 0)} (${monthLabels[(data?.highestRevenueMonth?.month ?? 1) - 1]})`}
            </p>
          </div>
        </div>

        {isEmpty ? (
          <div className='flex h-[320px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500'>
            Chưa có dữ liệu doanh thu trong năm này
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={320}>
            <LineChart data={revenueOverTime} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <defs>
                <linearGradient id='revenueLine' x1='0' y1='0' x2='1' y2='0'>
                  <stop offset='0%' stopColor='#14b8a6' />
                  <stop offset='100%' stopColor='#38bdf8' />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray='3 3' stroke='#e2e8f0' />
              <XAxis
                dataKey='month'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                dy={8}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#64748b' }}
                tickFormatter={(v) => formatVndCompact(Number(v ?? 0))}
              />
              <Tooltip
                cursor={{ stroke: '#99f6e4', strokeDasharray: '4 4' }}
                contentStyle={tooltipStyle}
                formatter={(v) => [formatVndFull(Number(v ?? 0)), 'Doanh thu']}
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
        )}
      </ChartContainer>

      <ChartContainer
        title='Doanh thu theo khóa học'
        subtitle='Top 5 khóa học có doanh thu cao nhất trong năm hiện tại'
      >
        {revenueByCourse.length === 0 ? (
          <div className='flex h-[300px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500'>
            Chưa có dữ liệu khóa học tạo doanh thu
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={300}>
            <BarChart data={revenueByCourse} layout='vertical' margin={{ top: 4, right: 12, left: 12, bottom: 4 }}>
              <CartesianGrid horizontal strokeDasharray='3 3' stroke='#eef2f7' />
              <XAxis
                type='number'
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                stroke='#64748b'
                tickFormatter={(v) => formatVndCompact(Number(v ?? 0))}
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
                formatter={(v) => [formatVndFull(Number(v ?? 0)), 'Doanh thu']}
                labelStyle={{ color: '#0f172a', fontWeight: 600, marginBottom: 6 }}
              />
              <Bar dataKey='revenue' radius={[0, 12, 12, 0]} barSize={28}>
                {revenueByCourse.map((_, index) => (
                  <Cell key={`revenue-cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartContainer>
    </div>
  )
}

export default RevenueTab
