import { Star } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { useNavigate } from 'react-router-dom'
import { CourseListItem } from '@/types/course-user'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const CourseCard = ({ courseItem }: { courseItem: CourseListItem }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/course-page/${courseItem.id}`)
  }

  return (
    <Card
      className='group border border-border/60 bg-card/60 backdrop-blur-sm cursor-pointer hover:shadow-lg transition-all duration-300 p-0'
      onClick={handleClick}
    >
      <div className='flex flex-col sm:flex-row items-stretch sm:h-[180px]'>
        <div className='relative w-full sm:w-[280px] h-[180px] flex-shrink-0'>
          <img
            src={courseItem.thumbnailUrl}
            alt={courseItem.title}
            className='absolute inset-0 w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105'
          />
        </div>
        {/* Content */}
        <div className='flex-1 flex flex-col justify-between p-5'>
          <div className='flex-1 space-y-3'>
            <h3 className='text-base sm:text-lg font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200'>
              {courseItem.title}
            </h3>

            <p className='text-sm text-muted-foreground/80 line-clamp-2'>{courseItem.shortDescription}</p>
            <div className='flex items-center gap-1'>
              <Avatar>
                <AvatarImage src={courseItem.instructor.image} />
                <AvatarFallback>{courseItem.instructor.name}</AvatarFallback>
              </Avatar>
              <p className='text-xs text-muted-foreground italic'>{courseItem.instructor.name}</p>
            </div>

            <div className='flex items-center gap-2'>
              <span className='text-sm font-semibold text-yellow-500'>{courseItem?.rating}</span>
              <div className='flex items-center gap-0.5'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.floor(courseItem?.rating || 0)
                        ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                        : 'text-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* <div className='flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground/80'>
              <div className='flex items-center gap-1'>
                <Clock className='w-3.5 h-3.5 text-blue-500/80' />
                <span>{courseItem?.duration}</span>
              </div>
              <span className='text-muted-foreground/50 hidden sm:inline-block'>•</span>
              <div className='flex items-center gap-1'>
                <BookOpen className='w-3.5 h-3.5 text-green-500/80' />
                <span>{courseItem?.lectures} bài giảng</span>
              </div>
              <span className='text-muted-foreground/50 hidden sm:inline-block'>•</span>
              <span className='capitalize'>{courseItem?.level}</span>
            </div> */}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default CourseCard
