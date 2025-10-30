import { Star, Clock, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'

export interface CourseCardProps {
  id: string
  title: string
  description: string
  instructor: {
    name: string
    avatar: string
  }
  rating: number
  reviewCount: number
  duration: string
  lectures: number
  level: string
  thumbnail: string
}

const CourseCard = ({
  id,
  title,
  description,
  instructor,
  rating,
  reviewCount,
  duration,
  lectures,
  level,
  thumbnail
}: CourseCardProps) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/course/${id}`)
  }

  return (
    <Card
      className='group border border-border/60 bg-card/60 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all duration-300 p-0'
      onClick={handleClick}
    >
      <div className='flex flex-col sm:flex-row items-stretch sm:h-[180px]'>
        <div className='relative w-full sm:w-[280px] h-[180px] flex-shrink-0'>
          <img
            src={thumbnail}
            alt={title}
            className='absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
          />
        </div>
        {/* Content */}
        <div className='flex-1 flex flex-col justify-between p-5'>
          <div className='flex-1 space-y-3'>
            <h3 className='text-base sm:text-lg font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200'>
              {title}
            </h3>

            <p className='text-sm text-muted-foreground/80 line-clamp-2'>{description}</p>
            <p className='text-xs text-muted-foreground italic'>{instructor.name}</p>

            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-yellow-500'>{rating}</span>
              <div className='flex items-center gap-0.5'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(rating)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                        : 'text-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <span className='text-xs text-muted-foreground/70'>({reviewCount.toLocaleString('vi-VN')})</span>
            </div>

            <div className='flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground/80'>
              <div className='flex items-center gap-1'>
                <Clock className='w-3.5 h-3.5 text-blue-500/80' />
                <span>{duration}</span>
              </div>
              <span className='text-muted-foreground/50 hidden sm:inline-block'>•</span>
              <div className='flex items-center gap-1'>
                <BookOpen className='w-3.5 h-3.5 text-green-500/80' />
                <span>{lectures} bài giảng</span>
              </div>
              <span className='text-muted-foreground/50 hidden sm:inline-block'>•</span>
              <span className='capitalize'>{level}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CourseCard
