import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronDown, Loader2 } from 'lucide-react'
import { Review } from '@/types/course.type'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import feedbackService, { FeedbackItem } from '@/services/feedback.service'

interface ReviewsListProps {
  reviews: Review[]
  reviewsPerPage?: number
  courseId?: string
}

export function ReviewsList({ reviews, reviewsPerPage = 5, courseId }: ReviewsListProps) {
  const [items, setItems] = useState<Review[]>(reviews)
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(false)
  const [initialLoaded, setInitialLoaded] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const useApiMode = !!courseId
  const mapFeedbackToReview = (f: FeedbackItem): Review => ({
    id: String(f._id),
    reviewerName: f.userName || 'User',
    reviewerAvatar: f.userAvatar || '',
    rating: f.rating,
    comment: f.message,
    date: f.createdAt
  })

  useEffect(() => {
    if (!useApiMode) return
    let cancelled = false
    async function loadFirst() {
      try {
        setError(null)
        const res = await feedbackService.getCourseFeedbacks({ courseId: courseId!, limit: reviewsPerPage })
        if (cancelled) return
        const mapped = res.items.map(mapFeedbackToReview)
        setItems(mapped)
        setHasMore(res.hasMore)
        setCursor(res.nextCursor)
      } catch (e: any) {
        if (!cancelled) setError('Chưa tải được đánh giá')
      } finally {
        if (!cancelled) setInitialLoaded(true)
      }
    }
    loadFirst()
    return () => {
      cancelled = true
    }
  }, [courseId, reviewsPerPage, useApiMode])

  const handleLoadMore = async () => {
    if (!useApiMode) {
      setItems((prev) => [...prev, ...reviews.slice(prev.length, prev.length + reviewsPerPage)])
      return
    }
    if (!hasMore || loadingMore) return
    try {
      setLoadingMore(true)
      const res = await feedbackService.getCourseFeedbacks({
        courseId: courseId!,
        limit: reviewsPerPage,
        cursor: cursor || undefined
      })
      const mapped = res.items.map(mapFeedbackToReview)
      setItems((prev) => [...prev, ...mapped])
      setHasMore(res.hasMore)
      setCursor(res.nextCursor)
    } catch (e: any) {
      setError('Chưa tải được đánh giá')
    } finally {
      setLoadingMore(false)
    }
  }

  const visibleReviews = items

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
      className='space-y-6 bg-white p-5 rounded-lg shadow-md'
    >
      <h2 className='text-2xl font-bold'>Đánh giá từ học viên</h2>

      <div className='space-y-4'>
        {error && <div className='text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-md'>{error}</div>}
        {!useApiMode && visibleReviews.length === 0 && (
          <p className='text-sm text-muted-foreground'>Chưa có đánh giá</p>
        )}
        {useApiMode && !initialLoaded && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Loader2 className='h-4 w-4 animate-spin' /> Đang tải đánh giá...
          </div>
        )}
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
          <Button variant='outline' onClick={handleLoadMore} className='gap-2' disabled={loadingMore}>
            {loadingMore && <Loader2 className='h-4 w-4 animate-spin' />}
            <span>{loadingMore ? 'Đang tải...' : 'Xem thêm đánh giá'}</span>
            {!loadingMore && <ChevronDown className='h-4 w-4' />}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
