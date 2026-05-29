import React, { useEffect, useMemo, useState } from 'react'
import { Users, BookOpen, Newspaper, ChevronDown } from 'lucide-react'
import { StatsCard } from '../StatsCard'
import instructorService from '@/services/instructor/instructor.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import Chart from 'react-apexcharts'

const DashboardStats: React.FC = () => {
  const [year, setYear] = useState<number>(2026)
  const userId = useAuthStore((s) => s.data?.userId)
  const [stats, setStats] = useState<{ totalCourse: number; totalStudent: number; totalBlog: number } | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [errorStats, setErrorStats] = useState<string | null>(null)
  const [revenueData, setRevenueData] = useState<number[]>(Array(12).fill(0))
  const [profitData, setProfitData] = useState<number[]>(Array(12).fill(0))
  const [studentData, setStudentData] = useState<number[]>(Array(12).fill(0))
  const [loadingChart, setLoadingChart] = useState(false)
  const [errorChart, setErrorChart] = useState<string | null>(null)
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

  useEffect(() => {
    if (!userId) return
    let mounted = true
    setLoadingStats(true)
    instructorService
      .getStatistic(userId)
      .then((data) => {
        if (mounted) {
          setStats(data)
          setErrorStats(null)
        }
      })
      .catch((e) => {
        if (mounted) {
          setErrorStats(e?.message || 'Không lấy được thống kê')
        }
      })
      .finally(() => mounted && setLoadingStats(false))
    return () => {
      mounted = false
    }
  }, [userId])

  // Fetch chart data when year or user changes
  useEffect(() => {
    if (!userId || !year) return
    let mounted = true
    setLoadingChart(true)
    setErrorChart(null)
    instructorService
      .getChart({ year, userId })
      .then((chart) => {
        if (!mounted) return
        const byMonth: Record<number, { revenue: number; profit: number; studentCount: number }> = {}
        chart.monthlyData.forEach((m) => {
          byMonth[m.month] = {
            revenue: Number(m.revenue) || 0,
            profit: Number(m.profit) || 0,
            studentCount: Number(m.studentCount) || 0
          }
        })
        const months = Array.from({ length: 12 }, (_, i) => i + 1)
        setRevenueData(months.map((m) => byMonth[m]?.revenue ?? 0))
        setProfitData(months.map((m) => byMonth[m]?.profit ?? 0))
        setStudentData(months.map((m) => byMonth[m]?.studentCount ?? 0))
      })
      .catch((e) => setErrorChart(e?.message || 'Không lấy được dữ liệu biểu đồ'))
      .finally(() => mounted && setLoadingChart(false))
    return () => {
      mounted = false
    }
  }, [userId, year])

  const formatCompact = (value: number) =>
    new Intl.NumberFormat('vi-VN', { notation: 'compact', maximumFractionDigits: 1 }).format(value)
  const formatCurrency = (value: number) => `${new Intl.NumberFormat('vi-VN').format(Math.round(value))} đ`
  const toMillion = (value: number) => Number((value / 1_000_00).toFixed(2))

  const options: ApexCharts.ApexOptions = {
    chart: {
      id: 'dashboard-line-chart',
      toolbar: { show: false },
      zoom: { enabled: false },
      foreColor: '#64748b',
      animations: {
        enabled: true,
        easing: 'easeinout',
        speed: 500
      }
    },
    grid: {
      borderColor: '#e2e8f0',
      strokeDashArray: 5,
      xaxis: { lines: { show: false } }
    },
    stroke: { curve: 'smooth', width: [3.5, 3, 3] },
    markers: {
      size: 0,
      strokeWidth: 0,
      hover: { size: 6, sizeOffset: 3 }
    },
    xaxis: {
      categories: monthLabels,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: '#94a3b8'
        }
      }
    },
    yaxis: {
      labels: {
        formatter: (value: number) => `${value.toFixed(1)}M`,
        style: {
          fontSize: '12px',
          fontWeight: 500,
          colors: '#94a3b8'
        }
      }
    },
    colors: ['#0f766e', '#d97706', '#a78bfa'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.85,
        type: 'vertical',
        opacityFrom: 0.35,
        opacityTo: 0.04,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    legend: {
      position: 'top',
      horizontalAlign: 'left',
      labels: {
        colors: '#334155'
      },
      markers: {
        width: 10,
        height: 10,
        radius: 12
      },
      itemMargin: {
        horizontal: 12,
        vertical: 6
      }
    },
    tooltip: {
      shared: true,
      intersect: false,
      style: {
        fontSize: '12px'
      },
      x: {
        formatter: (value) => `Tháng ${value}`
      },
      y: {
        formatter: (value: number, { seriesIndex }) => {
          if (seriesIndex === 2) return `${Math.round(value)} học viên`
          return formatCurrency(value * 1_000_000)
        }
      }
    }
  }

  const series = useMemo(
    () => [
      { name: 'Doanh thu', data: revenueData.map(toMillion) },
      { name: 'Lợi nhuận', data: profitData.map(toMillion) },
      { name: 'Học viên', data: studentData }
    ],
    [revenueData, profitData, studentData]
  )

  return (
    <div className='mb-4 space-y-4'>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
        <StatsCard
          title='Khóa học'
          value={loadingStats ? '...' : String(stats?.totalCourse ?? 0)}
          icon={BookOpen}
          variant='primary'
        />
        <StatsCard
          title='Học viên'
          value={loadingStats ? '...' : String(stats?.totalStudent ?? 0)}
          icon={Users}
          variant='success'
        />
        <StatsCard
          title='Bài viết'
          value={loadingStats ? '...' : String(stats?.totalBlog ?? 0)}
          icon={Newspaper}
          variant='warning'
        />
      </div>
      {errorStats && <p className='text-xs text-red-600'>Lỗi: {errorStats}</p>}

      <div className='w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-5'>
        <div className='mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <h3 className='text-lg font-semibold tracking-tight text-slate-900'>Hiệu suất khóa học</h3>
            <p className='text-sm text-slate-500'>Thống kê doanh thu và số lượng học viên theo thời gian</p>
          </div>

          <label className='group relative inline-flex items-center'>
            <span className='mr-3 text-sm font-medium text-slate-600'>Year</span>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className='appearance-none rounded-xl border border-slate-300 bg-slate-50 py-2 pl-3 pr-9 text-sm font-medium text-slate-800 outline-none transition duration-200 hover:border-slate-400 focus:border-slate-500 focus:bg-white'
            >
              {[2020, 2021, 2022, 2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
            <ChevronDown className='pointer-events-none absolute right-3 size-4 text-slate-500 transition duration-200 group-hover:text-slate-700' />
          </label>
        </div>

        <div className='rounded-xl border border-slate-100 bg-white p-2 transition duration-200 hover:shadow-sm'>
          {loadingChart ? (
            <div className='h-[320px] animate-pulse rounded-lg bg-slate-100' />
          ) : errorChart ? (
            <div className='flex h-[320px] items-center justify-center rounded-lg border border-rose-200 bg-rose-50 px-4 text-sm text-rose-700'>
              {errorChart}
            </div>
          ) : (
            <Chart options={options} series={series} type='area' height={320} />
          )}
        </div>
      </div>
    </div>
  )
}

export default DashboardStats
