import { Star } from 'lucide-react'
import { BiSolidDetail } from 'react-icons/bi'
import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel'

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
    <Card className='h-full min-h-[260px] sm:min-h-[280px] shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br bg-white flex flex-col'>
      <CardContent className='p-4 md:p-6 flex-1 flex flex-col'>
        <div className='flex flex-col md:flex-row items-start gap-3 md:gap-4'>
          <Avatar className='w-10 md:w-12 h-10 md:h-12 ring-2 ring-primary/10 flex-shrink-0'>
            <AvatarImage src={feedback.userAvatar} alt={feedback.userName} />
            <AvatarFallback className='bg-gradient-primary text-primary-foreground font-semibold text-xs md:text-sm'>
              {feedback?.userName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0 w-full'>
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3 mb-2'>
              <h3 className='font-semibold text-foreground text-sm md:text-base truncate flex-1'>{feedback?.userName}</h3>
              <div className='flex items-center gap-2 text-xs md:text-sm flex-shrink-0'>
                <span className='text-muted-foreground hidden sm:inline'>Đánh giá:</span>
                <div className='flex items-center gap-0.5'>
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
            <p className='text-muted-foreground text-xs md:text-sm mb-3 leading-relaxed italic line-clamp-3'>
              {feedback.message}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Feedbacks = ({ feedbacks }: { feedbacks: FeedbackProps[] }) => {
  const [api, setApi] = useState<CarouselApi>()

  useEffect(() => {
    if (!api) return

    const timer = setInterval(() => {
      api.scrollNext()
    }, 4000)

    return () => clearInterval(timer)
  }, [api])

  return (
    <section className='py-4 md:py-6 bg-gradient-subtle'>
      <div className='px-4 md:px-6'>
        <h4 className='font-bold bg-primary text-white px-4 md:px-5 py-2.5 md:py-3 rounded-r-3xl max-w-full md:max-w-lg text-left flex items-center text-sm md:text-base gap-2'>
          <BiSolidDetail size={16} className='md:size-5 flex-shrink-0' />
          <span className='truncate'>Phản hồi từ học viên khóa học này</span>
        </h4>
      </div>

      {/* Carousel showing 3 items at once on large screens (responsive) */}
      <div className='w-full px-4 sm:px-6 lg:px-24 py-6 md:py-8'>
        <Carousel 
          setApi={setApi}
          opts={{ align: 'start', loop: true }} 
          className='w-full'
        >
          <CarouselContent className='-ml-4 sm:-ml-3'>
            {feedbacks.map((feedback, index) => (
              // responsive basis: 1 per row on mobile, 2 on sm, 3 on lg
              <CarouselItem key={index} className='basis-full sm:basis-1/2 lg:basis-1/3 pl-4 sm:pl-3'>
                <Feedback feedback={feedback} />
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className='flex justify-center gap-2 mt-4'>
            <CarouselPrevious className='h-9 w-9 md:h-10 md:w-10' />
            <CarouselNext className='h-9 w-9 md:h-10 md:w-10' />
          </div>
        </Carousel>
      </div>
    </section>
  )
}

export default Feedbacks
