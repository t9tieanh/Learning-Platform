import React, { useEffect, useMemo, useState } from 'react'
import { Users, BookOpen, Newspaper } from 'lucide-react'
import { StatsCard } from '../StatsCard'
import instructorService from '@/services/instructor/instructor.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import Chart from 'react-apexcharts'

const DashboardStats: React.FC = () => {
  const [year, setYear] = useState<number>(2025)
  const userId = useAuthStore((s) => s.data?.userId)
  const [stats, setStats] = useState<{ totalCourse: number; totalStudent: number; totalBlog: number } | null>(null)
  const [loadingStats, setLoadingStats] = useState(false)
  const [errorStats, setErrorStats] = useState<string | null>(null)
  const [revenueData, setRevenueData] = useState<number[]>(Array(12).fill(0))
  const [profitData, setProfitData] = useState<number[]>(Array(12).fill(0))
  const [studentData, setStudentData] = useState<number[]>(Array(12).fill(0))
  const [loadingChart, setLoadingChart] = useState(false)
  const [errorChart, setErrorChart] = useState<string | null>(null)

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

  const options: ApexCharts.ApexOptions = {
    chart: {
      id: 'dashboard-line-chart',
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    },
    colors: ['#34d399', '#f59e0b', '#a78bfa'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        type: 'vertical',
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 100]
      }
    },
    dataLabels: { enabled: false },
    legend: { position: 'top' },
    tooltip: {
      y: { formatter: (val: number) => `${val}` }
    }
  }

  const series = useMemo(
    () => [
      { name: 'Doanh thu', data: revenueData },
      { name: 'Lợi nhuận', data: profitData },
      { name: 'Học viên', data: studentData }
    ],
    [revenueData, profitData, studentData]
  )

  return (
    <div className='flex flex-col md:flex-row gap-6 items-start mb-4'>
      {/* Stats cards */}
      <div className='flex flex-col gap-4'>
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
        {errorStats && <p className='text-xs text-red-600'>Lỗi: {errorStats}</p>}
      </div>

      {/* Chart với chọn năm */}
      <div className='flex-1 bg-white dark:bg-zinc-900 p-4 rounded-lg shadow border-slate-200'>
        <div className='flex justify-end mb-2 text-base items-center gap-3'>
          Năm
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className='border rounded px-2 border-slate-600 py-1 bg-800 dark:text-white '
          >
            {[2020, 2021, 2022, 2023, 2024, 2025].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <Chart options={options} series={series} type='area' height={260} />
      </div>
    </div>
  )
}

export default DashboardStats
