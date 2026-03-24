import { Star, MessageSquare, ThumbsUp, Minus, ThumbsDown } from 'lucide-react'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { feedbackMetrics, recentReviews, sentimentSummary } from '@/data/mockData'

const Stars = ({ rating }: { rating: number }) => (
  <div className='flex gap-0.5'>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={14} className={i <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'} />
    ))}
  </div>
)

const FeedbackTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='flex items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6'>
          <div className='rounded-2xl bg-amber-100 p-4'>
            <Star size={32} className='fill-amber-400 text-amber-400' />
          </div>
          <div>
            <p className='text-sm font-medium text-slate-500'>Đánh giá trung bình</p>
            <p className='text-4xl font-bold tracking-tight text-slate-900'>{feedbackMetrics.averageRating}</p>
            <Stars rating={Math.round(feedbackMetrics.averageRating)} />
          </div>
        </div>

        <StatCard
          title='Tổng số đánh giá'
          value={feedbackMetrics.totalReviews}
          icon={MessageSquare}
          variant='primary'
          trend={{ value: 14.6, positive: true }}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-1 gap-4'>
        <ChartContainer title='Đánh giá gần đây' className='lg:col-span-2'>
          <div className='space-y-4 max-h-[360px] overflow-y-auto pr-1'>
            {recentReviews.map((review) => (
              <div key={review.id} className='flex gap-3 border-b border-slate-200 pb-4 last:border-0 last:pb-0'>
                <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600'>
                  {review.user
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>

                <div className='min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-sm font-semibold text-slate-900'>{review.user}</span>
                    <Stars rating={review.rating} />
                    <span className='text-xs text-slate-500'>{review.date}</span>
                  </div>

                  <p className='mt-1 text-sm leading-relaxed text-slate-500'>{review.comment}</p>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>
      </div>
    </div>
  )
}

export default FeedbackTab
