import { Star } from 'lucide-react'
import { BiSolidDetail } from 'react-icons/bi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel'

interface FeedbackProps {
  id: string
  userId: string
  courseId: string
  rating: number
  message: string
  userName?: string
  userAvatar?: string
}

const Feedback = ({ feedback }: { feedback: FeedbackProps }) => {
  return (
    <Card className='h-full min-h-[280px] shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br bg-white flex flex-col'>
      <CardContent className='p-3 md:p-6 flex-1 flex flex-col'>
        <div className='flex flex-col md:flex-row items-start gap-3 md:gap-4'>
          <Avatar className='w-10 md:w-12 h-10 md:h-12 ring-2 ring-primary/10 flex-shrink-0'>
            <AvatarImage src={feedback.userAvatar} alt={feedback.userName} />
            <AvatarFallback className='bg-gradient-primary text-primary-foreground font-semibold text-xs md:text-sm'>
              {feedback?.userName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0 w-full'>
            <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-2'>
              <h3 className='font-semibold text-foreground text-sm md:text-base truncate'>{feedback?.userName}</h3>
              <div className='flex flex-col gap-1 text-xs md:text-sm'>
                <div className='text-muted-foreground'>Đã đánh giá:</div>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3 md:w-4 h-3 md:h-4 ${
                        i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Badge variant='secondary' className='mb-3 text-xs md:text-sm inline-flex'>
              Sinh viên
            </Badge>
            <p className='text-muted-foreground text-xs md:text-sm mb-4 leading-relaxed italic line-clamp-3'>
              {feedback.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Feedbacks = ({ feedbacks }: { feedbacks: FeedbackProps[] }) => {
  return (
    <section className='py-4 md:py-6 bg-gradient-subtle'>
      <h4 className='font-bold bg-primary text-white px-3 md:px-4 py-2 md:py-3 rounded-r-3xl max-w-full md:max-w-lg mx-auto md:mx-0 text-center md:text-left flex items-center justify-center md:justify-start text-sm md:text-base gap-2'>
        <BiSolidDetail size={16} className='md:size-5 flex-shrink-0' />
        <span>Phản hồi từ học viên khóa học này</span>
      </h4>

      {/* Carousel showing 3 items at once on large screens (responsive) */}
      <div className='w-full px-3 sm:px-6 lg:px-24 py-6 md:py-8'>
        <Carousel opts={{ align: 'start' }} autoplayDelay={2000} className='w-full'>
          <CarouselContent>
            {feedbacks.map((feedback, index) => (
              // responsive basis: 1 per row on mobile, 2 on sm, 3 on lg
              <CarouselItem key={index} className='basis-full sm:basis-1/2 lg:basis-1/3'>
                <div className='p-1'>
                  <Feedback feedback={feedback} />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>
    </section>
  )
}

export default Feedbacks
