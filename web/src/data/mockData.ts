// ── User Analytics ──
export const studentsOverTime = [
  { date: 'Jan', students: 120 },
  { date: 'Feb', students: 185 },
  { date: 'Mar', students: 240 },
  { date: 'Apr', students: 310 },
  { date: 'May', students: 390 },
  { date: 'Jun', students: 475 },
  { date: 'Jul', students: 520 },
  { date: 'Aug', students: 610 },
  { date: 'Sep', students: 680 },
  { date: 'Oct', students: 740 },
  { date: 'Nov', students: 830 },
  { date: 'Dec', students: 920 }
]

export const studentsByCountry = [
  { country: 'USA', students: 340 },
  { country: 'India', students: 280 },
  { country: 'UK', students: 150 },
  { country: 'Germany', students: 120 },
  { country: 'Brazil', students: 95 },
  { country: 'Canada', students: 80 }
]

export const studentsByAge = [
  { age: '18-24', students: 320 },
  { age: '25-34', students: 410 },
  { age: '35-44', students: 180 },
  { age: '45-54', students: 70 },
  { age: '55+', students: 40 }
]

export const trafficSource = [
  { name: 'SEO', value: 45 },
  { name: 'Ads', value: 30 },
  { name: 'Direct', value: 25 }
]

export const userMetrics = {
  totalStudents: 920,
  newStudents: 142,
  returningStudents: 778
}

// ── Progress Tracking ──
export const progressMetrics = {
  completionRate: 68,
  completedStudents: 625,
  avgCompletionTime: '4.2 weeks'
}

export const funnelData = [
  { stage: 'Enrolled', value: 920 },
  { stage: 'Started', value: 780 },
  { stage: '50% Done', value: 560 },
  { stage: 'Finished', value: 625 }
]

export const progressDistribution = [
  { range: '0-25%', students: 140 },
  { range: '25-50%', students: 155 },
  { range: '50-75%', students: 200 },
  { range: '75-100%', students: 425 }
]

// ── Revenue ──
export const revenueOverTime = [
  { month: 'Jan', revenue: 4200 },
  { month: 'Feb', revenue: 5800 },
  { month: 'Mar', revenue: 7200 },
  { month: 'Apr', revenue: 9100 },
  { month: 'May', revenue: 11400 },
  { month: 'Jun', revenue: 13200 },
  { month: 'Jul', revenue: 14800 },
  { month: 'Aug', revenue: 17500 },
  { month: 'Sep', revenue: 19200 },
  { month: 'Oct', revenue: 21000 },
  { month: 'Nov', revenue: 24500 },
  { month: 'Dec', revenue: 28300 }
]

export const revenueByCourse = [
  { course: 'React Mastery', revenue: 12400 },
  { course: 'TypeScript Pro', revenue: 9800 },
  { course: 'Node.js Deep Dive', revenue: 7600 },
  { course: 'CSS Architecture', revenue: 5200 },
  { course: 'GraphQL Basics', revenue: 3800 }
]

export const revenueMetrics = {
  totalRevenue: 176200,
  conversionRate: 12.4,
  refundRate: 2.1
}

// ── Feedback ──
export const feedbackMetrics = {
  averageRating: 4.6,
  totalReviews: 482
}

export const recentReviews = [
  {
    id: 1,
    user: 'Sarah Chen',
    rating: 5,
    comment: 'Incredible depth of content. The hands-on projects really solidified my understanding.',
    date: '2 hours ago'
  },
  {
    id: 2,
    user: 'Marcus Johnson',
    rating: 4,
    comment: 'Great course overall. Would love more advanced examples in the later modules.',
    date: '5 hours ago'
  },
  {
    id: 3,
    user: 'Aisha Patel',
    rating: 5,
    comment: "Best React course I've taken. The instructor explains complex concepts with clarity.",
    date: '1 day ago'
  },
  {
    id: 4,
    user: 'Tom Wright',
    rating: 3,
    comment: 'Good fundamentals coverage but felt a bit rushed in the state management section.',
    date: '1 day ago'
  },
  {
    id: 5,
    user: 'Elena Rodriguez',
    rating: 5,
    comment: 'Absolutely worth every penny. I landed my first dev job after completing this!',
    date: '2 days ago'
  },
  {
    id: 6,
    user: 'James Kim',
    rating: 4,
    comment: 'Solid content and great community support. Looking forward to the advanced course.',
    date: '3 days ago'
  }
]

export const sentimentSummary = {
  positive: 78,
  neutral: 16,
  negative: 6
}
