export interface MonthlyRevenueItem {
  month: number
  revenue: number
  profit: number
}

export interface TopCourseRevenueItem {
  courseId: string
  courseTitle: string
  revenue: number
}

export interface HighestRevenueMonth {
  month: number
  revenue: number
}

export interface RevenueAnalytics {
  instructorId: string
  year: number
  totalRevenueInYear: number
  totalProfitInYear: number
  revenueTrendPercent: number
  profitTrendPercent: number
  highestRevenueMonth: HighestRevenueMonth
  monthlyRevenue: MonthlyRevenueItem[]
  topCoursesByRevenue: TopCourseRevenueItem[]
}
