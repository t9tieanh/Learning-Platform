import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Star, ChevronDown, Loader2 } from 'lucide-react'
import { Review } from '@/types/course.type'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import feedbackService, { FeedbackItem } from '@/services/feedback/feedback.service'
import { Loader } from '../ui/loader'

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
          <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200'}`} />
        ))}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45 }}
      className='relative isolate overflow-hidden rounded-xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_22px_rgba(15,23,42,0.05)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.09)]'
    >
      <div className='pointer-events-none absolute inset-x-0 top-0 -z-10 h-12 bg-gradient-to-r from-rose-100/70 via-amber-100/45 to-transparent' />
      <h2 className='mb-5 text-lg font-semibold tracking-tight text-slate-900'>Đánh giá từ học viên</h2>

      <div className='space-y-4'>
        {error && <div className='rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-600'>{error}</div>}
        {!useApiMode && visibleReviews.length === 0 && <p className='text-sm text-slate-500'>Chưa có đánh giá</p>}
        {useApiMode && !initialLoaded && <Loader />}

        {visibleReviews.map((review, index) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 + index * 0.05 }}
            className='rounded-lg border border-slate-200 bg-slate-50/70 p-4'
          >
            <div className='flex items-start gap-4'>
              <Avatar className='h-10 w-10 shrink-0 border border-slate-200'>
                <AvatarImage src={review.reviewerAvatar} alt={review.reviewerName} />
                <AvatarFallback className='bg-white text-slate-700'>
                  {review.reviewerName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='min-w-0 flex-1'>
                <div className='mb-2 flex items-center justify-between gap-4'>
                  <h3 className='text-sm font-semibold text-slate-800'>{review.reviewerName}</h3>
                  <span className='whitespace-nowrap text-xs text-slate-500'>
                    {new Date(review.date).toLocaleDateString('vi-VN')}
                  </span>
                </div>

                <div className='mb-3'>{renderStars(review.rating)}</div>
                <p className='text-sm leading-relaxed text-slate-700'>{review.comment}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {hasMore && (
        <div className='flex justify-center'>
          <Button variant='outline' onClick={handleLoadMore} className='gap-2 rounded-lg border-slate-200 bg-white hover:bg-amber-50 hover:text-amber-700' disabled={loadingMore}>
            {loadingMore && <Loader2 className='h-4 w-4 animate-spin' />}
            <span>{loadingMore ? 'Đang tải...' : 'Xem thêm đánh giá'}</span>
            {!loadingMore && <ChevronDown className='h-4 w-4' />}
          </Button>
        </div>
      )}
    </motion.div>
  )
}
