import { motion } from 'framer-motion'
import { Play, Calendar, Edit, BarChart3 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CourseHeroProps {
  title: string
  coverImage: string
  status: 'published' | 'draft'
  publishedAt: string
  price?: number
  onPlayIntro: () => void
  onEdit: () => void
}

export function CourseHero({ title, coverImage, status, publishedAt, price, onPlayIntro, onEdit }: CourseHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className='relative overflow-hidden rounded-2xl shadow-lg'
    >
      <div className='absolute inset-0 bg-slate-50' />

      <div className='relative grid gap-6 p-8 lg:grid-cols-2 lg:gap-8'>
        {/* Left: Course Info */}
        <div className='flex flex-col justify-center space-y-6'>
          <div className='flex items-center gap-3 flex-wrap'>
            {/* Trạng thái chính: nổi bật (xanh lục) */}
            <Badge className='bg-green-500 text-white text-sm p-1'>Đang mở</Badge>

            {/* Ngày: trung tính, không cần màu đậm */}
            <div className='flex items-center gap-2 text-sm text-muted-foreground bg-gray-100 p-1 rounded-md'>
              <Calendar className='h-4 w-4 text-gray-600' />
              <span>{new Date(publishedAt).toLocaleDateString('vi-VN')}</span>
            </div>

            {/* Giá: nổi bật nhẹ (cam), nhưng có thể dùng outline cho đỡ nặng */}
            {price && (
              <Badge variant='outline' className='text-sm border-orange-500 text-orange-600 font-semibold p-1'>
                {price.toLocaleString('vi-VN')}đ
              </Badge>
            )}
          </div>

          <h1 className='text-3xl font-bold tracking-tight lg:text-4xl xl:text-4xl text-slate-700'>{title}</h1>

          <div className='flex gap-3 flex-wrap'>
            <Button onClick={onEdit} size='lg' className='shadow-primary'>
              <Edit className='mr-2 h-4 w-4' />
              Chỉnh sửa
            </Button>
          </div>
        </div>

        <div className='relative group'>
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className='relative aspect-video overflow-hidden rounded-xl shadow-md'
          >
            <img src={coverImage} alt={title} className='h-full w-full object-cover' />
            <div className='absolute inset-0 bg-gradient-to-t from-black/60 to-transparent' />

            <Button
              onClick={onPlayIntro}
              size='lg'
              className='absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full h-16 w-16 p-0 shadow-lg group-hover:scale-110 transition-transform'
              aria-label='Phát video giới thiệu'
            >
              <Play className='h-6 w-6 ml-1' />
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
