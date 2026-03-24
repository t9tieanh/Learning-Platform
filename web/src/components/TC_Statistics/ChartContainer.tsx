import { ReactNode } from 'react'

interface ChartContainerProps {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}

const ChartContainer = ({ title, subtitle, children, className = '' }: ChartContainerProps) => {
  return (
    <section
      className={`relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.25)] backdrop-blur-sm ${className}`}
    >
      <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent' />
      <div className='absolute -top-16 right-8 h-28 w-28 rounded-full bg-sky-100/40 blur-3xl' />

      <div className='relative mb-6 flex items-start justify-between gap-4'>
        <div className='space-y-1'>
          <h3 className='text-lg font-semibold tracking-tight text-slate-950'>{title}</h3>
          {subtitle && <p className='text-sm leading-6 text-slate-500'>{subtitle}</p>}
        </div>
        <div className='hidden h-10 w-10 rounded-2xl border border-slate-200/80 bg-slate-50 sm:block' />
      </div>

      <div className='relative'>{children}</div>
    </section>
  )
}

export default ChartContainer
