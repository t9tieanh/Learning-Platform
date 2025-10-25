import { motion } from 'framer-motion'
import { DollarSign, Users, Star } from 'lucide-react'
import { Separator } from '@/components/ui/separator'

interface StatsSidebarProps {
  revenue: number
  studentsCount: number
  rating: number
  status: 'published' | 'draft'
}

export function StatsSidebar({ revenue, studentsCount, rating }: StatsSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className='space-y-6 sticky top-6'
    >
      <div className='rounded-xl bg-gradient-card p-6 shadow-md bg-white'>
        <h3 className='text-lg font-semibold mb-4'>Thống kê nhanh</h3>

        <div className='space-y-4'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-green-500 p-2'>
                <DollarSign className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Doanh thu</p>
                <p className='text-lg font-semibold'>{revenue.toLocaleString('vi-VN')} VND</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-orange-400 p-2'>
                <Users className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Học viên</p>
                <p className='text-lg font-semibold'>{studentsCount.toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          <Separator />

          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-yellow-400 p-2'>
                <Star className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-sm text-muted-foreground'>Đánh giá</p>
                <p className='text-lg font-semibold'>{rating}/5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
