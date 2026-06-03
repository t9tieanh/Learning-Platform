import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { AlertTriangle, BookOpen, Clock, FileText, ShieldAlert, Sparkles, Star, Users } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import userService from '@/services/user/user.service'
import {
  AdminBusinessPerformance,
  AdminBusinessPerformanceRange,
  AdminPendingActions,
  DataAdminHome,
  TopCourseAdminItem,
  TopInstructorAdminItem
} from '@/types/user'
import { toast } from 'sonner'
import courseImage from '@/assets/images/course.jpg'
import user1 from '@/assets/images/user1.jpg'

type RangeKey = AdminBusinessPerformanceRange

type PerformancePoint = {
  label: string
  revenue: number
  students: number
}

const baseCardClass =
  'rounded-2xl border border-slate-200/70 bg-gradient-to-br from-white via-slate-50/80 to-slate-100/70 shadow-sm transition-all duration-300 hover:shadow-md'

const formatNumber = (value: number) => new Intl.NumberFormat('vi-VN').format(value)
const formatCurrency = (value: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)

const formatCompactCurrency = (value: number) => {
  if (value >= 1000) return `${value}M`
  return `${value}M`
}

const ranges: { key: RangeKey; label: string }[] = [
  { key: '7d', label: '7 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: '90d', label: '90 ngày' },
  { key: '12m', label: '12 tháng' }
]

export default function Dashboard() {
  const [data, setData] = useState<DataAdminHome | null>(null)
  const [topCourses, setTopCourses] = useState<TopCourseAdminItem[]>([])
  const [topInstructors, setTopInstructors] = useState<TopInstructorAdminItem[]>([])
  const [pendingActions, setPendingActions] = useState<AdminPendingActions | null>(null)
  const [metricsLoading, setMetricsLoading] = useState(false)
  const [pendingLoading, setPendingLoading] = useState(false)
  const [topCoursesLoading, setTopCoursesLoading] = useState(false)
  const [topInstructorsLoading, setTopInstructorsLoading] = useState(false)
  const [performanceLoading, setPerformanceLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [range, setRange] = useState<RangeKey>('12m')
  const [businessPerformance, setBusinessPerformance] = useState<AdminBusinessPerformance | null>(null)

  useEffect(() => {
    let active = true
    const fetchMetrics = async () => {
      try {
        setMetricsLoading(true)
        setError(null)
        const homeRes = await userService.getAdminHome()
        if (!active) return
        setData(homeRes.result ?? null)
      } catch (e: any) {
        if (!active) return
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải dữ liệu tổng quan admin'
        setError(msg)
        toast.error(msg)
      } finally {
        if (active) setMetricsLoading(false)
      }
    }
    fetchMetrics()
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true

    const fetchPendingActions = async () => {
      try {
        setPendingLoading(true)
        const response = await userService.getAdminPendingActions()
        if (!active) return
        setPendingActions(response.result ?? null)
      } catch (e: any) {
        if (!active) return
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách cần xử lý'
        toast.error(msg)
        setPendingActions(null)
      } finally {
        if (active) setPendingLoading(false)
      }
    }

    const fetchTopCourses = async () => {
      try {
        setTopCoursesLoading(true)
        const response = await userService.getAdminTopCourses(5)
        if (!active) return
        setTopCourses(response.result ?? [])
      } catch (e: any) {
        if (!active) return
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách khóa học nổi bật'
        toast.error(msg)
        setTopCourses([])
      } finally {
        if (active) setTopCoursesLoading(false)
      }
    }

    const fetchTopInstructors = async () => {
      try {
        setTopInstructorsLoading(true)
        const response = await userService.getAdminTopInstructors(5)
        if (!active) return
        setTopInstructors(response.result ?? [])
      } catch (e: any) {
        if (!active) return
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải danh sách giảng viên nổi bật'
        toast.error(msg)
        setTopInstructors([])
      } finally {
        if (active) setTopInstructorsLoading(false)
      }
    }

    void fetchPendingActions()
    void fetchTopCourses()
    void fetchTopInstructors()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const fetchBusinessPerformance = async () => {
      try {
        setPerformanceLoading(true)
        const response = await userService.getAdminBusinessPerformance(range)
        if (!active) return
        setBusinessPerformance(response.result ?? null)
      } catch (e: any) {
        if (!active) return
        const msg = e?.response?.data?.message || e?.message || 'Không thể tải dữ liệu hiệu suất kinh doanh'
        toast.error(msg)
        setBusinessPerformance(null)
      } finally {
        if (active) setPerformanceLoading(false)
      }
    }

    fetchBusinessPerformance()
    return () => {
      active = false
    }
  }, [range])

  const performanceData = useMemo<PerformancePoint[]>(
    () =>
      (businessPerformance?.points ?? []).map((point) => ({
        label: point.label,
        revenue: Math.round((point.revenue / 1_000_000) * 100) / 100,
        students: point.studentCount
      })),
    [businessPerformance]
  )

  const metricCards = [
    {
      title: 'Tổng khóa học',
      value: data?.courseCnt ?? (metricsLoading ? '…' : 0),
      icon: BookOpen,
      iconClass: 'bg-sky-50 text-sky-600'
    },
    {
      title: 'Giảng viên',
      value: data?.instructorCnt ?? (metricsLoading ? '…' : 0),
      icon: Users,
      iconClass: 'bg-cyan-50 text-cyan-600'
    },
    {
      title: 'Chứng chỉ chờ duyệt',
      value: data?.certificateCnt ?? (metricsLoading ? '…' : 0),
      icon: Clock,
      iconClass: 'bg-amber-50 text-amber-600'
    },
    {
      title: 'Bài viết',
      value: data?.blogCnt ?? (metricsLoading ? '…' : 0),
      icon: FileText,
      iconClass: 'bg-emerald-50 text-emerald-600'
    }
  ]

  const actionItems = [
    {
      label: 'Khóa học chờ duyệt',
      value: pendingActions?.coursePendingReviewCount ?? 0,
      icon: BookOpen,
      tone: 'text-amber-700 bg-amber-50 border-amber-200'
    },
    {
      label: 'Chứng chỉ chờ xác minh',
      value: pendingActions?.certificatePendingCount ?? 0,
      icon: ShieldAlert,
      tone: 'text-orange-700 bg-orange-50 border-orange-200'
    },
    {
      label: 'Báo cáo vi phạm',
      value: pendingActions?.rejectedCourseCount ?? 0,
      icon: AlertTriangle,
      tone: 'text-rose-700 bg-rose-50 border-rose-200'
    }
  ]

  const hasPendingActions = pendingLoading || actionItems.some((item) => item.value > 0)

  return (
    <div className='space-y-5'>
      <section className='flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white px-5 py-4 shadow-sm'>
        <div>
          <p className='text-xs font-semibold uppercase tracking-[0.22em] text-slate-500'>Tổng quan nền tảng</p>
          <h1 className='mt-1 text-2xl font-semibold tracking-tight text-slate-900'>Bảng điều khiển quản trị</h1>
          <p className='mt-1 text-sm text-slate-500'>Theo dõi hiệu suất vận hành và tăng trưởng toàn nền tảng.</p>
        </div>
        <Badge className='rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-cyan-700'>
          <Sparkles className='mr-1.5 h-3.5 w-3.5' />
          Dữ liệu trực quan
        </Badge>
      </section>

      {error ? (
        <div className='rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm font-medium text-rose-700'>
          {error}
        </div>
      ) : null}

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {metricCards.map((item) => {
          const Icon = item.icon
          return (
            <Card
              key={item.title}
              className={cn(baseCardClass, 'bg-gradient-to-br from-white via-sky-50/70 to-cyan-100/60')}
            >
              <CardContent className='p-3.5'>
                <div className='flex items-start justify-between gap-3'>
                  <div>
                    <p className='text-xs font-medium text-slate-500'>{item.title}</p>
                    <p className='mt-1.5 text-2xl font-semibold tracking-tight text-slate-900'>{item.value}</p>
                  </div>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${item.iconClass}`}>
                    <Icon className='h-4.5 w-4.5' />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </section>

      <section className='grid gap-4 lg:grid-cols-10'>
        <Card className={cn(baseCardClass, 'bg-gradient-to-br from-white via-cyan-50/60 to-sky-100/50 lg:col-span-7')}>
          <CardHeader className='px-5 py-4'>
            <div className='flex flex-wrap items-start justify-between gap-3'>
              <div>
                <CardTitle className='text-lg font-semibold text-slate-900'>Hiệu suất kinh doanh</CardTitle>
                <CardDescription>
                  Doanh thu và tăng trưởng học viên theo thời gian
                  {performanceLoading ? <span className='ml-2 text-cyan-600'>Đang cập nhật...</span> : null}
                </CardDescription>
              </div>
              <div className='flex flex-wrap items-center gap-2'>
                {ranges.map((item) => (
                  <button
                    key={item.key}
                    onClick={() => setRange(item.key)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-semibold transition-all',
                      range === item.key
                        ? 'border-slate-900 bg-slate-900 text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    )}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className='px-5 pb-4 pt-1'>
            <div className='grid gap-4 lg:grid-cols-2'>
              <div className='relative h-[220px] rounded-xl border border-slate-100 bg-gradient-to-br from-white via-sky-50/60 to-cyan-100/40 p-3'>
                <p className='mb-2 text-xs font-medium text-slate-500'>Doanh thu (triệu VND)</p>
                <ResponsiveContainer width='100%' height='100%' className={cn(performanceLoading && 'opacity-60')}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} />
                    <XAxis dataKey='label' tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value: number) => [`${formatCompactCurrency(value)}`, 'Doanh thu']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    />
                    <Line type='monotone' dataKey='revenue' stroke='#0284c7' strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
                {!performanceLoading && performanceData.length === 0 ? (
                  <div className='absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-500'>
                    Chưa có dữ liệu doanh thu
                  </div>
                ) : null}
              </div>
              <div className='relative h-[220px] rounded-xl border border-slate-100 bg-gradient-to-br from-white via-cyan-50/60 to-teal-100/40 p-3'>
                <p className='mb-2 text-xs font-medium text-slate-500'>Học viên mới</p>
                <ResponsiveContainer width='100%' height='100%' className={cn(performanceLoading && 'opacity-60')}>
                  <AreaChart data={performanceData}>
                    <defs>
                      <linearGradient id='studentsFill' x1='0' y1='0' x2='0' y2='1'>
                        <stop offset='5%' stopColor='#0e7490' stopOpacity={0.35} />
                        <stop offset='95%' stopColor='#0e7490' stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' vertical={false} />
                    <XAxis dataKey='label' tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip
                      formatter={(value: number) => [formatNumber(value), 'Học viên']}
                      contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    />
                    <Area
                      type='monotone'
                      dataKey='students'
                      stroke='#0e7490'
                      fill='url(#studentsFill)'
                      strokeWidth={2.5}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                {!performanceLoading && performanceData.length === 0 ? (
                  <div className='absolute inset-0 flex items-center justify-center text-sm font-medium text-slate-500'>
                    Chưa có dữ liệu học viên
                  </div>
                ) : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className={cn(baseCardClass, 'bg-gradient-to-br from-white via-amber-50/70 to-orange-100/50 lg:col-span-3')}
        >
          <CardHeader className='px-5 py-4'>
            <CardTitle className='text-lg font-semibold text-slate-900'>Cần xử lý</CardTitle>
            <CardDescription>Các mục cần admin xử lý ưu tiên</CardDescription>
          </CardHeader>
          <CardContent className='px-5 pb-4 pt-1'>
            {hasPendingActions ? (
              <div className='space-y-2'>
                {actionItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <div
                      key={item.label}
                      className={cn('flex items-center justify-between rounded-xl border px-3 py-2.5', item.tone)}
                    >
                      <div className='flex items-center gap-2.5'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-white/70'>
                          <Icon className='h-4 w-4' />
                        </div>
                        <p className='text-sm font-medium'>{item.label}</p>
                      </div>
                      <span className='text-base font-semibold'>{item.value}</span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className='flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm font-medium text-slate-500'>
                Không có tác vụ cần xử lý
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <section className='grid gap-4 xl:grid-cols-2'>
        <Card className={cn(baseCardClass, 'bg-gradient-to-br from-white via-violet-50/60 to-indigo-100/40')}>
          <CardHeader className='px-5 py-4'>
            <CardTitle className='text-lg font-semibold text-slate-900'>Giảng viên hàng đầu</CardTitle>
            <CardDescription>Leaderboard giảng viên theo số học viên và số khóa học</CardDescription>
          </CardHeader>
          <CardContent className='px-5 pb-4 pt-1'>
            <div className='space-y-2.5'>
              {topInstructors.map((ins, index) => (
                <div key={ins.instructorId} className='flex items-center gap-3 rounded-xl border border-slate-100 p-3'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white'>
                    #{ins.rank || index + 1}
                  </div>
                  <Avatar className='h-10 w-10 border border-slate-200'>
                    <AvatarImage src={ins.instructorAvatar || user1} alt={ins.instructorName} />
                    <AvatarFallback>{ins.instructorName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-slate-900'>{ins.instructorName}</p>
                    <div className='mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600'>
                      <span>{formatNumber(ins.studentCount)} học viên</span>
                      <span>{ins.courseCount} khóa học</span>
                    </div>
                  </div>
                </div>
              ))}
              {!topInstructorsLoading && topInstructors.length === 0 ? (
                <p className='rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500'>
                  Chưa có dữ liệu giảng viên nổi bật
                </p>
              ) : null}
              {topInstructorsLoading ? (
                <p className='rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500'>
                  Đang tải dữ liệu giảng viên nổi bật...
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>

        <Card className={cn(baseCardClass, 'bg-gradient-to-br from-white via-blue-50/60 to-sky-100/50')}>
          <CardHeader className='px-5 py-4'>
            <CardTitle className='text-lg font-semibold text-slate-900'>Khóa học nổi bật</CardTitle>
            <CardDescription>Top 5 theo học viên, rating và doanh thu</CardDescription>
          </CardHeader>
          <CardContent className='px-5 pb-4 pt-1'>
            <div className='space-y-3'>
              {topCourses.map((course) => (
                <div key={course.courseId} className='flex gap-3 rounded-xl border border-slate-100 p-3'>
                  <img
                    src={course.thumbnailUrl || courseImage}
                    alt={course.title}
                    className='h-16 w-24 rounded-lg object-cover'
                  />
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm font-semibold text-slate-900'>{course.title}</p>
                    <div className='mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600'>
                      <span className='inline-flex items-center gap-1'>
                        <Users className='h-3.5 w-3.5' /> {formatNumber(course.studentCount)} học viên
                      </span>
                      <span className='inline-flex items-center gap-1'>
                        <Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400' /> {course.rating}
                      </span>
                      <span className='font-semibold text-emerald-700'>{formatCurrency(course.revenue)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!topCoursesLoading && topCourses.length === 0 ? (
                <p className='rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500'>
                  Chưa có dữ liệu khóa học nổi bật
                </p>
              ) : null}
              {topCoursesLoading ? (
                <p className='rounded-xl border border-dashed border-slate-200 px-3 py-4 text-center text-sm text-slate-500'>
                  Đang tải dữ liệu khóa học nổi bật...
                </p>
              ) : null}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className='sr-only' aria-live='polite'>
        Dữ liệu bảng điều khiển đã cập nhật
      </section>
    </div>
  )
}
