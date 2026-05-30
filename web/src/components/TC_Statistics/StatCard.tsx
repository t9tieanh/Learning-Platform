import { ComponentType } from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: ComponentType<{ size?: string | number; strokeWidth?: string | number; className?: string }>
  trend?: { value: number; positive: boolean }
  trendLabel?: string
  variant?: 'default' | 'primary' | 'success' | 'warning'
}

const cardStyles: Record<string, string> = {
  default: 'border-slate-200/80 bg-white text-slate-900 shadow-[0_14px_34px_-22px_rgba(15,23,42,0.28)]',
  primary:
    'border-sky-200/70 bg-gradient-to-br from-sky-50 via-white to-blue-50 text-slate-900 shadow-[0_16px_36px_-24px_rgba(14,165,233,0.38)]',
  success:
    'border-emerald-200/70 bg-gradient-to-br from-emerald-50 via-white to-teal-50 text-slate-900 shadow-[0_16px_36px_-24px_rgba(16,185,129,0.36)]',
  warning:
    'border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-orange-50 text-slate-900 shadow-[0_16px_36px_-24px_rgba(245,158,11,0.34)]'
}

const iconStyles: Record<string, string> = {
  default: 'border-slate-200/80 bg-slate-50 text-slate-600',
  primary: 'border-sky-200/70 bg-sky-500 text-white',
  success: 'border-emerald-200/70 bg-emerald-500 text-white',
  warning: 'border-amber-200/70 bg-amber-500 text-white'
}

const accentStyles: Record<string, string> = {
  default: 'from-slate-200/80 to-transparent',
  primary: 'from-sky-300/60 to-transparent',
  success: 'from-emerald-300/60 to-transparent',
  warning: 'from-amber-300/60 to-transparent'
}

const StatCard = ({ title, value, subtitle, icon: Icon, trend, trendLabel = 'so với tháng trước', variant = 'default' }: StatCardProps) => {
  return (
    <div
      className={`group relative overflow-hidden rounded-[28px] border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_22px_50px_-28px_rgba(15,23,42,0.32)] ${cardStyles[variant]}`}
    >
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/90 to-transparent' />
      <div
        className={`absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br ${accentStyles[variant]} blur-2xl`}
      />
      <div className='absolute -bottom-14 right-8 h-24 w-24 rounded-full bg-white/40 blur-2xl' />

      <div className='relative flex items-start justify-between gap-4'>
        <div className='min-w-0 flex-1 space-y-3'>
          <div className='space-y-1'>
            <p className='text-xs font-semibold uppercase tracking-[0.22em] text-slate-500'>{title}</p>
            <p className='text-3xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]'>{value}</p>
          </div>

          {subtitle && <p className='max-w-[22rem] text-sm leading-6 text-slate-500'>{subtitle}</p>}

          {trend && (
            <div
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${
                trend.positive
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {trend.positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {Math.abs(trend.value)}% {trendLabel}
            </div>
          )}
        </div>

        <div
          className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border shadow-sm transition-transform duration-300 group-hover:scale-105 ${iconStyles[variant]}`}
        >
          <Icon size={22} strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

export default StatCard
