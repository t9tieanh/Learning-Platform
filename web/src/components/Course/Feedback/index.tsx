import { Star } from 'lucide-react'
import { BiSolidDetail } from 'react-icons/bi'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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
    <Card className='h-full shadow-card hover:shadow-soft transition-all duration-300 hover:-translate-y-1 border-0 bg-gradient-to-br bg-white'>
      <CardContent className='p-6'>
        <div className='flex items-start gap-4'>
          <Avatar className='w-12 h-12 ring-2 ring-primary/10'>
            <AvatarImage src={feedback.userAvatar} alt={feedback.userName} />
            <AvatarFallback className='bg-gradient-primary text-primary-foreground font-semibold'>
              {feedback?.userName?.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='font-semibold text-foreground'>{feedback?.userName}</h3>
              <div className='flex flex-col gap-1 text-sm'>
                <div>Đã đánh giá:</div>
                <div className='flex items-center gap-1'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < feedback.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-muted text-muted'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Badge variant='secondary' className='mb-3 text-xs'>
              Sinh viên
            </Badge>
            <p className='text-muted-foreground text-sm mb-4 leading-relaxed italic'>{feedback.message}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const Feedbacks = ({ feedbacks }: { feedbacks: FeedbackProps[] }) => {
  return (
    <section className='py-4 bg-gradient-subtle'>
      <h4 className='font-bold bg-primary text-white p-2 rounded-r-3xl max-w-lg mx-auto md:mx-0 text-center flex items-center justify-center md:justify-start'>
        <BiSolidDetail size={20} className='mr-2' />
        Phản hồi từ học viên khóa học này
      </h4>

      {/* Container responsive */}
      <div className='w-full px-4 sm:px-6 lg:px-12 py-8'>
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {feedbacks.map((feedback, index) => (
            <Feedback key={index} feedback={feedback} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Feedbacks
