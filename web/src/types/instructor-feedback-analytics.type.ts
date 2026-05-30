export interface FeedbackMetrics {
  averageRating: number
  totalReviews: number
  trend: {
    value: number
    positive: boolean
  }
}

export interface SentimentSummary {
  positive: number
  neutral: number
  negative: number
}

export interface RecentReviewItem {
  id: string
  userId: string
  user: string
  userAvatar: string
  rating: number
  comment: string
  date: string
}

export interface InstructorFeedbackOverview {
  feedbackMetrics: FeedbackMetrics
  sentimentSummary: SentimentSummary
  recentReviews: RecentReviewItem[]
}
