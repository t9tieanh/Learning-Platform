export interface DataAdminHome {
  courseCnt: number
  instructorCnt: number
  certificateCnt: number
  blogCnt: number
}

export interface AdminPendingActions {
  coursePendingReviewCount: number
  certificatePendingCount: number
  rejectedCourseCount: number
}

export interface TopCourseAdminItem {
  courseId: string
  title: string
  thumbnailUrl: string
  studentCount: number
  rating: number
  revenue: number
}

export interface TopInstructorAdminItem {
  instructorId: string
  instructorName: string
  instructorAvatar: string
  studentCount: number
  courseCount: number
  revenue: number
  rank: number
}

export type AdminBusinessPerformanceRange = '7d' | '30d' | '90d' | '12m'

export interface AdminBusinessPerformancePoint {
  label: string
  bucketKey: string
  startDate: string
  endDate: string
  revenue: number
  studentCount: number
}

export interface AdminBusinessPerformance {
  range: AdminBusinessPerformanceRange
  points: AdminBusinessPerformancePoint[]
}
