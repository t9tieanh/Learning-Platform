import { ClockIcon, ReaderIcon, StarIcon } from '@radix-ui/react-icons'
import { Send } from 'lucide-react'
import CustomButton from '@/components/common/Button'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

interface CourseCardProps {
  id: string | number
  title: string
  description: string
  originalPrice: number
  salePrice: number
  instructor: {
    name: string
    avatar: string
  }
  rating: number
  reviewCount: number
  duration: string
  lectures: number
  category?: string
  level: string
  isBestseller?: boolean
  thumbnail: string
  onViewCourse?: (courseId: string) => void | Promise<void>
  layout?: 'list' | 'grid'
}

export const CourseCard = ({
  id,
  title,
  description,
  originalPrice,
  salePrice,
  instructor,
  rating,
  reviewCount,
  duration,
  lectures,
  category,
  level,
  isBestseller,
  thumbnail,
  onViewCourse,
  layout = 'list'
}: CourseCardProps) => {
  const navigate = useNavigate()
  const isGrid = layout === 'grid'
  const formatPrice = (price: number) => `${price.toLocaleString('vi-VN')}đ`

  const handleClickCourse = () => {
    const courseId = String(id)
    onViewCourse?.(courseId)
    navigate(`/course/${courseId}`)
  }

  return (
    <Card
      className='group cursor-pointer overflow-hidden rounded-2xl border border-slate-200 bg-white p-0 py-0 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(15,23,42,0.08)]'
      onClick={handleClickCourse}
    >
      <div className={isGrid ? 'flex flex-col' : 'flex flex-col md:flex-row md:items-stretch md:h-[240px]'}>
        <div
          className={`relative overflow-hidden bg-blue-100 shrink-0 ${
            isGrid
              ? 'w-full aspect-[4/3]'
              : 'w-full h-48 md:h-full md:w-[20rem]'
          }`}
        >
          <img
            src={thumbnail}
            alt={title}
            className='h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]'
          />
          {isBestseller && (
            <span className='absolute left-3 top-3 rounded-full bg-amber-400 px-2.5 py-1 text-[10px] font-bold text-slate-900 shadow-sm'>
              Bestseller
            </span>
          )}
        </div>

        <div className={`flex min-w-0 flex-1 flex-col justify-between ${isGrid ? 'gap-4 p-5' : 'gap-3 p-5 md:p-6'}`}>
          <div className='space-y-2'>
            <div>
              <h3 className='line-clamp-2 text-sm font-bold leading-snug text-slate-900 transition-colors duration-200 group-hover:text-blue-600 md:text-base'>
                {title}
              </h3>
              <p className='mt-0.5 line-clamp-2 text-[13px] leading-relaxed text-slate-500'>{description}</p>
            </div>

            <div className='flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-slate-500'>
              <div className='flex items-center gap-2'>
                <img
                  src={instructor.avatar}
                  alt={instructor.name}
                  className='h-6 w-6 rounded-full object-cover ring-2 ring-white shadow-sm'
                />
                <span className='font-semibold text-slate-700'>{instructor.name}</span>
              </div>

              <div className='flex items-center gap-1 text-amber-500'>
                <StarIcon className='h-3.5 w-3.5' />
                <span className='font-semibold text-slate-700'>{rating}</span>
              </div>

              {category && (
                <span className='rounded-full bg-blue-100 px-2.5 py-1 font-semibold text-blue-600'>{category}</span>
              )}
              <div className='flex items-center gap-1'>
                <ClockIcon className='h-3.5 w-3.5 text-slate-400' />
                <span>{duration}</span>
              </div>
              <div className='flex items-center gap-1'>
                <ReaderIcon className='h-3.5 w-3.5 text-slate-400' />
                <span>{lectures} bài</span>
              </div>
            </div>
          </div>

          <div className='h-px w-full bg-slate-100' />

          <div className={`flex items-center justify-between ${isGrid ? 'pt-1' : ''}`}>
            <div>
              <p className={`font-bold text-orange-500/80 ${isGrid ? 'text-base' : 'text-lg'}`}>{formatPrice(salePrice)}</p>
              {originalPrice > salePrice && (
                <p className='text-[10px] font-medium text-slate-400 line-through'>{formatPrice(originalPrice)}</p>
              )}
            </div>
            <CustomButton
              label='Xem chi tiết'
              icon={<Send className='h-3.5 w-3.5' />}
              iconPosition='right'
              className='inline-flex h-10 min-w-[118px] items-center justify-center rounded-full bg-blue-600 px-4 text-xs font-semibold text-white shadow-[0_6px_18px_rgba(37,99,235,0.12)] transition-all duration-200 ease-in-out hover:bg-blue-700 hover:shadow-[0_10px_24px_rgba(37,99,235,0.2)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 active:scale-95'
              onClick={(e) => {
                e.stopPropagation()
                handleClickCourse()
              }}
            />
          </div>
        </div>
      </div>
    </Card>
  )
}
