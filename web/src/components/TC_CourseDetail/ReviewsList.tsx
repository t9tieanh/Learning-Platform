import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronDown } from 'lucide-react'
import { Review } from '@/types/course.type'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ReviewsListProps {
  reviews: Review[]
  reviewsPerPage?: number
}

export function ReviewsList({ reviews, reviewsPerPage = 5 }: ReviewsListProps) {
  const [visibleCount, setVisibleCount] = useState(reviewsPerPage)

  const visibleReviews = reviews.slice(0, visibleCount)
  const hasMore = visibleCount < reviews.length

  const renderStars = (rating: number) => {
    return (
      <div className='flex gap-0.5'>
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-accent text-accent' : 'fill-muted text-muted'}`} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className='space-y-6'
    >
      <h2 className='text-2xl font-bold'>Đánh giá từ học viên</h2>

      <div className='space-y-4'>
        {visibleReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + index * 0.05 }}
            className='rounded-xl bg-card p-6 shadow-md'
          >
            <div className='flex items-start gap-4'>
              <Avatar className='h-12 w-12 flex-shrink-0'>
                <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                <AvatarFallback>
                  {review.reviewerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex-1 min-w-0'>
                <div className='flex items-center justify-between gap-4 mb-2'>
                  <h3 className='font-semibold'>{review.reviewerName}</h3>
                  <span className='text-sm text-muted-foreground whitespace-nowrap'>
                    {new Date(review.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className='mb-3'>{renderStars(review.rating)}</div>

                <p className='text-sm leading-relaxed text-foreground'>{review.comment}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className='flex justify-center'>
          <Button variant='outline' onClick={() => setVisibleCount((prev) => prev + reviewsPerPage)} className='gap-2'>
            <span>Xem thêm đánh giá</span>
            <ChevronDown className='h-4 w-4' />
          </Button>
        </div>
      )}
    </motion.div>
  )
}
