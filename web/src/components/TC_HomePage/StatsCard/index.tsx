import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: string
    isPositive: boolean
  }
  variant?: 'default' | 'success' | 'warning' | 'primary'
}

export function StatsCard({ title, value, subtitle, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
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
    <Card className='hover:shadow-md transform transition-transform duration-300 hover:scale-105'>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex-1'>
            <p className='text-base font-medium text-muted-foreground mb-1'>{title}</p>
            <p className='text-2xl font-bold text-foreground'>{value}</p>
            {subtitle && <p className='text-sm text-muted-foreground mt-1'>{subtitle}</p>}
            {trend && (
              <div className='flex items-center mt-2'>
                <span
                  className={`text-sm font-medium ${trend.isPositive ? 'text-gradient-success' : 'text-destructive'}`}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}
                </span>
                <span className='text-sm text-muted-foreground ml-1'>so với tháng trước</span>
              </div>
            )}
          </div>

          <div className={`p-3 rounded-lg ${styles.iconBg}`}>
            <Icon className={`h-8 w-8 ${styles.iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
