import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  variant?: 'default' | 'success' | 'warning' | 'primary'
}

export function StatsCard({ title, value, subtitle, icon: Icon, variant = 'default' }: StatsCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'success':
        return {
          iconBg: 'bg-[linear-gradient(to_right,#19ba54,#28d17c,#3ce38f)]',
          iconColor: 'text-white'
        }
      case 'warning':
        return {
          iconBg: 'bg-[linear-gradient(to_right,#f97c22,#ff9a44,#ffc371)]',
          iconColor: 'text-white'
        }
      case 'primary':
        return {
          iconBg: 'bg-[linear-gradient(to_right,#186ed7,#1e88e5,#42a5f5)]',
          iconColor: 'text-white'
        }
      default:
        return {
          iconBg: 'bg-[linear-gradient(to_right,#7b4397,#9c27b0,#e040fb)]',
          iconColor: 'text-white'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <Card className='w-full rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md'>
      <CardContent className='p-x-2'>
        <div className='flex items-center gap-4'>
          <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${styles.iconBg}`}>
            <Icon className={`h-5 w-5 ${styles.iconColor}`} />
          </div>

          <div className='flex flex-col gap-2'>
            <span className='text-sm font-medium text-slate-500'>{title}</span>
            <span className='block text-2xl font-bold leading-none text-slate-900'>{value}</span>
            {subtitle ? <span className='text-xs text-slate-400'>{subtitle}</span> : null}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
