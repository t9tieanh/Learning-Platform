import { motion } from 'framer-motion'
import { DollarSign, Users, Star } from 'lucide-react'

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
      className='sticky top-6 space-y-6'
    >
      <div className='rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.07)]'>
        <h3 className='mb-4 text-2xl font-semibold tracking-tight text-slate-900'>Thống kê nhanh</h3>

        <div className='space-y-4'>
          <div className='rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-emerald-500 p-2'>
                <DollarSign className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-sm text-slate-500'>Doanh thu</p>
                <p className='text-lg font-semibold leading-tight text-slate-900'>{revenue.toLocaleString('vi-VN')} VND</p>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-cyan-50 p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-500 p-2'>
                <Users className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-sm text-slate-500'>Học viên</p>
                <p className='text-lg font-semibold leading-tight text-slate-900'>{studentsCount.toLocaleString('vi-VN')}</p>
              </div>
            </div>
          </div>

          <div className='rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-yellow-50 p-4'>
            <div className='flex items-center gap-3'>
              <div className='rounded-xl bg-amber-500 p-2.5 shadow-lg shadow-amber-500/20'>
                <Star className='h-5 w-5 text-white' />
              </div>
              <div>
                <p className='text-sm text-slate-500'>Đánh giá</p>
                <p className='text-lg font-semibold leading-tight text-slate-900'>{rating}/5.0</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
