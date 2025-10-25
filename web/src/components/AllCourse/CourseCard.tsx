import { Star, Clock, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface CourseCardProps {
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
  level: string
  isBestseller?: boolean
  thumbnail: string
}

export const CourseCard = ({
  title,
  description,
  originalPrice,
  salePrice,
  instructor,
  rating,
  reviewCount,
  duration,
  lectures,
  level,
  thumbnail
}: CourseCardProps) => {
  return (
    <Card className='overflow-hidden group hover:shadow-xl border border-border/60 bg-card/60 backdrop-blur-sm cursor-pointer'>
      <div className='flex flex-row items-stretch h-40'>
        <div className='w-72 h-full flex-shrink-0 overflow-hidden'>
          <img src={thumbnail} alt={title} className='w-full h-full object-cover object-center' />
        </div>
        {/* Content */}
        <div className='flex-1 flex flex-col justify-between pl-5'>
          <div className='flex-1 pb-5'>
            <h3 className='text-lg font-semibold mb-2 line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200'>
              {title}
            </h3>

            <p className='text-sm text-muted-foreground/80 mb-2 line-clamp-2'>{description}</p>
            <p className='text-xs text-muted-foreground italic mb-2'>{instructor.name}</p>

            {/* ⭐ Rating */}
            <div className='flex items-center gap-2 mb-2'>
              <span className='text-sm font-semibold text-yellow-500'>{rating}</span>
              <div className='flex items-center gap-0.5'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                        : 'text-muted-foreground/20'
                      }`}
                  />
                ))}
              </div>
              <span className='text-xs text-muted-foreground/70'>({reviewCount.toLocaleString('vi-VN')})</span>
            </div>

            <div className='flex items-center gap-3 text-xs text-muted-foreground/80'>
              <div className='flex items-center gap-1'>
                <Clock className='w-3.5 h-3.5 text-blue-500/80' />
                <span>{duration}</span>
              </div>
              <span className='text-muted-foreground/50'>•</span>
              <div className='flex items-center gap-1'>
                <BookOpen className='w-3.5 h-3.5 text-green-500/80' />
                <span>{lectures} bài giảng</span>
              </div>
              <span className='text-muted-foreground/50'>•</span>
              <span className='capitalize'>{level}</span>
            </div>
          </div>
        </div>
        {/* 💰 Giá */}
        <div className='w-32 flex-shrink-0 pr-5 flex flex-col items-end justify-start'>
          <p className='text-xl font-bold text-orange-500/90'>₫{salePrice.toLocaleString('vi-VN')}</p>
          {originalPrice > salePrice && (
            <p className='text-sm text-muted-foreground line-through'>₫{originalPrice.toLocaleString('vi-VN')}</p>
          )}
        </div>
      </div>
    </Card>
  )
}
