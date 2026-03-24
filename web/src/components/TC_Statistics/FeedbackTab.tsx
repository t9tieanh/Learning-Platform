import { MessageSquare, Minus, Star, ThumbsDown, ThumbsUp } from 'lucide-react'
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

const sentimentItems = [
  {
    key: 'positive',
    label: 'Tích cực',
    value: sentimentSummary.positive,
    icon: ThumbsUp,
    cardClass: 'border-emerald-200 bg-emerald-50/80',
    iconClass: 'bg-emerald-500 text-white',
    textClass: 'text-emerald-950'
  },
  {
    key: 'neutral',
    label: 'Trung lập',
    value: sentimentSummary.neutral,
    icon: Minus,
    cardClass: 'border-amber-200 bg-amber-50/80',
    iconClass: 'bg-amber-500 text-white',
    textClass: 'text-amber-950'
  },
  {
    key: 'negative',
    label: 'Tiêu cực',
    value: sentimentSummary.negative,
    icon: ThumbsDown,
    cardClass: 'border-rose-200 bg-rose-50/80',
    iconClass: 'bg-rose-500 text-white',
    textClass: 'text-rose-950'
  }
] as const

const FeedbackTab = () => {
  return (
    <div className='space-y-6'>
      <div className='grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]'>
        <div className='relative overflow-hidden rounded-[28px] border border-amber-200/70 bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6 shadow-[0_16px_40px_-26px_rgba(245,158,11,0.3)]'>
          <div className='absolute -right-12 -top-10 h-32 w-32 rounded-full bg-amber-200/35 blur-3xl' />
          <div className='relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-4'>
              <div className='flex h-16 w-16 items-center justify-center rounded-[22px] border border-amber-200/70 bg-white shadow-sm'>
                <Star size={30} className='fill-amber-400 text-amber-400' />
              </div>
              <div>
                <p className='text-xs font-semibold uppercase tracking-[0.22em] text-amber-700'>Đánh giá trung bình</p>
                <div className='mt-2 flex items-end gap-3'>
                  <p className='text-5xl font-semibold tracking-tight text-slate-950'>
                    {feedbackMetrics.averageRating}
                  </p>
                  <p className='pb-1 text-sm text-slate-500'>trên 5.0</p>
                </div>
                <div className='mt-2'>
                  <Stars rating={Math.round(feedbackMetrics.averageRating)} />
                </div>
              </div>
            </div>

            <div className='grid grid-cols-3 gap-2 sm:w-[280px]'>
              {sentimentItems.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.key} className={`rounded-2xl border p-3 ${item.cardClass}`}>
                    <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${item.iconClass}`}>
                      <Icon size={16} />
                    </div>
                    <p className='text-xs font-medium text-slate-500'>{item.label}</p>
                    <p className={`mt-1 text-lg font-semibold ${item.textClass}`}>{item.value}%</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <StatCard
          title='Tổng số đánh giá'
          value={feedbackMetrics.totalReviews}
          subtitle='Lượng phản hồi đang tăng đều từ học viên sau khi hoàn thành bài học.'
          icon={MessageSquare}
          variant='primary'
          trend={{ value: 14.6, positive: true }}
        />
      </div>

      <ChartContainer title='Đánh giá gần đây' subtitle='Những phản hồi mới nhất từ học viên trên nền tảng'>
        <div className='space-y-4 max-h-[420px] overflow-y-auto pr-1'>
          {recentReviews.map((review) => (
            <div
              key={review.id}
              className='rounded-3xl border border-slate-200/80 bg-slate-50/70 p-4 transition-colors duration-200 hover:border-slate-300 hover:bg-white'
            >
              <div className='flex gap-4'>
                <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-400 text-sm font-bold text-white shadow-sm'>
                  {review.user
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>

                <div className='min-w-0 flex-1'>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='space-y-1'>
                      <span className='block text-sm font-semibold text-slate-950'>{review.user}</span>
                      <Stars rating={review.rating} />
                    </div>
                    <span className='rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500'>
                      {review.date}
                    </span>
                  </div>

                  <p className='mt-3 text-sm leading-7 text-slate-600'>{review.comment}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ChartContainer>
    </div>
  )
}

export default FeedbackTab
