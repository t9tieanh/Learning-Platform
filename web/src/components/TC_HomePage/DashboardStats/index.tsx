import React, { useState } from 'react'
import { Users, BookOpen, Newspaper } from 'lucide-react'
import { StatsCard } from '../StatsCard'
import Chart from 'react-apexcharts'

const DashboardStats: React.FC = () => {
  const [year, setYear] = useState<number>(2025)

  const yearlyData: Record<number, number[][]> = {
    2020: [
      [10, 15, 12, 18, 20, 25, 22, 28, 24, 30, 27, 35], // Doanh thu
      [8, 12, 15, 10, 18, 14, 12, 20, 16, 22, 19, 25], // Lợi nhuận
      [12, 18, 15, 22, 20, 27, 25, 30, 28, 35, 32, 40] // Học viên
    ],
    2021: [
      [12, 16, 20, 24, 22, 28, 30, 35, 32, 38, 36, 42],
      [9, 14, 18, 12, 20, 16, 14, 22, 18, 24, 20, 28],
      [14, 20, 18, 25, 22, 30, 28, 34, 30, 38, 35, 42]
    ],
    2022: [
      [15, 20, 22, 28, 25, 32, 30, 38, 35, 42, 40, 48],
      [10, 16, 20, 15, 22, 18, 16, 25, 20, 28, 22, 30],
      [16, 22, 20, 28, 24, 32, 30, 36, 34, 40, 38, 45]
    ],
    2023: [
      [18, 24, 26, 32, 30, 38, 35, 42, 40, 48, 45, 52],
      [12, 18, 22, 16, 25, 20, 18, 28, 22, 30, 24, 32],
      [18, 25, 22, 30, 26, 35, 32, 38, 36, 42, 40, 48]
    ],
    2024: [
      [20, 26, 30, 35, 32, 40, 38, 45, 42, 50, 48, 55],
      [14, 20, 24, 18, 28, 22, 20, 30, 24, 32, 26, 35],
      [20, 28, 25, 32, 28, 38, 35, 40, 38, 45, 42, 50]
    ],
    2025: [
      [22, 28, 32, 38, 35, 42, 40, 48, 45, 52, 50, 58],
      [16, 22, 26, 20, 30, 25, 22, 35, 28, 38, 30, 40],
      [22, 30, 28, 35, 32, 40, 38, 45, 42, 50, 48, 55]
    ]
  }

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

  const series = [
    { name: 'Doanh thu (triệu đồng)', data: yearlyData[year][0] },
    { name: 'Lợi nhuận (triệu đồng)', data: yearlyData[year][1] },
    { name: 'Học viên', data: yearlyData[year][2] }
  ]

  return (
    <div className='flex flex-col md:flex-row gap-6 items-start mb-4'>
      {/* Stats cards */}
      <div className='flex flex-col gap-4'>
        <StatsCard
          title='Khóa học'
          value='24'
          icon={BookOpen}
          variant='primary'
          trend={{ value: '+2', isPositive: true }}
        />
        <StatsCard
          title='Học viên'
          value='328'
          icon={Users}
          variant='success'
          trend={{ value: '+15', isPositive: true }}
        />
        <StatsCard
          title='Bài viết'
          value='19'
          icon={Newspaper}
          variant='warning'
          trend={{ value: '+15', isPositive: true }}
        />
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
