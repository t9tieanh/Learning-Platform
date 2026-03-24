import { Star, MessageSquare, ThumbsUp, Minus, ThumbsDown } from 'lucide-react'
import StatCard from './StatCard'
import ChartContainer from './ChartContainer'
import { feedbackMetrics, recentReviews, sentimentSummary } from '@/data/mockData'

const Stars = ({ rating }: { rating: number }) => (
  <div className='flex gap-0.5'>
    {[1, 2, 3, 4, 5].map((i) => (
      <Star key={i} size={14} className={i <= rating ? 'fill-warning text-warning' : 'text-muted'} />
    ))}
  </div>
)

const FeedbackTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div className='rounded-2xl border border-border bg-card p-6 flex items-center gap-6'>
          <div className='rounded-2xl bg-warning/15 p-4'>
            <Star size={32} className='fill-warning text-warning' />
          </div>
          <div>
            <p className='text-sm font-medium text-muted-foreground'>Average Rating</p>
            <p className='text-4xl font-bold tracking-tight text-card-foreground'>{feedbackMetrics.averageRating}</p>
            <Stars rating={Math.round(feedbackMetrics.averageRating)} />
          </div>
        </div>
        <StatCard
          title='Total Reviews'
          value={feedbackMetrics.totalReviews}
          icon={MessageSquare}
          variant='primary'
          trend={{ value: 14.6, positive: true }}
        />
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-4'>
        <ChartContainer title='Sentiment Summary' className='lg:col-span-1'>
          <div className='space-y-4 pt-2'>
            {[
              { label: 'Positive', value: sentimentSummary.positive, icon: ThumbsUp, color: 'bg-success' },
              { label: 'Neutral', value: sentimentSummary.neutral, icon: Minus, color: 'bg-warning' },
              { label: 'Negative', value: sentimentSummary.negative, icon: ThumbsDown, color: 'bg-destructive' }
            ].map((s) => (
              <div key={s.label} className='flex items-center gap-3'>
                <s.icon size={16} className='text-muted-foreground shrink-0' />
                <div className='flex-1'>
                  <div className='flex justify-between text-xs mb-1'>
                    <span className='font-medium text-card-foreground'>{s.label}</span>
                    <span className='text-muted-foreground'>{s.value}%</span>
                  </div>
                  <div className='h-2 rounded-full bg-muted overflow-hidden'>
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ChartContainer>

        <ChartContainer title='Recent Reviews' className='lg:col-span-2'>
          <div className='space-y-4 max-h-[360px] overflow-y-auto pr-1'>
            {recentReviews.map((review) => (
              <div key={review.id} className='flex gap-3 pb-4 border-b border-border last:border-0 last:pb-0'>
                <div className='w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary shrink-0'>
                  {review.user
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div className='min-w-0'>
                  <div className='flex items-center gap-2 flex-wrap'>
                    <span className='text-sm font-semibold text-card-foreground'>{review.user}</span>
                    <Stars rating={review.rating} />
                    <span className='text-xs text-muted-foreground'>{review.date}</span>
                  </div>
                  <p className='text-sm text-muted-foreground mt-1 leading-relaxed'>{review.comment}</p>
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
