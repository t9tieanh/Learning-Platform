import { motion } from 'framer-motion'
import { DollarSign, Users, Star, Share2, Eye, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

interface StatsSidebarProps {
  revenue: number
  studentsCount: number
  rating: number
  status: 'published' | 'draft'
  onPublish: () => void
  onUnpublish: () => void
  onShare: () => void
}

export function StatsSidebar({
  revenue,
  studentsCount,
  rating,
  status,
  onPublish,
  onUnpublish,
  onShare
}: StatsSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className='space-y-6 sticky top-6'
    >
      {/* Stats Card */}
      <div className='rounded-xl bg-gradient-card p-6 shadow-md'>
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

      {/* Actions Card */}
      <div className='rounded-xl bg-card p-6 shadow-md space-y-3'>
        <h3 className='text-lg font-semibold mb-4'>Hành động</h3>

        {status === 'published' ? (
          <Button onClick={onUnpublish} variant='outline' className='w-full gap-2'>
            <Globe className='h-4 w-4' />
            Gỡ xuất bản
          </Button>
        ) : (
          <Button onClick={onPublish} className='w-full gap-2 shadow-primary'>
            <Globe className='h-4 w-4' />
            Xuất bản khóa học
          </Button>
        )}

        <Button onClick={onShare} variant='outline' className='w-full gap-2'>
          <Share2 className='h-4 w-4' />
          Chia sẻ
        </Button>
      </div>
    </motion.div>
  )
}
