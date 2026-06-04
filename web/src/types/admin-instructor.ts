export interface AdminInstructorListItem {
  id: string
  name: string
  email: string
  avatar: string
  courseCount: number
}

export interface AdminInstructorListResult {
  items: AdminInstructorListItem[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNext: boolean
}

export interface AdminInstructorProfile {
  id: string
  name: string
  email: string
  avatar: string
  description: string
  headline: string
  expertise: string[]
}

export interface AdminInstructorMetrics {
  courseCount: number
  studentsCount: number
  totalRevenue: number
  completionRate: number
  averageRating: number
}

export interface AdminInstructorLearnersSnapshot {
  year: number
  totalStudentsInYear: number
  newStudentsCurrentMonth: number
  newStudentsTrendPercent: number
}

export interface AdminInstructorRevenuePoint {
  month: number
  revenue: number
  profit: number
}

export interface AdminInstructorRevenueSnapshot {
  year: number
  totalRevenueInYear: number
  totalProfitInYear: number
  highestRevenueMonth: number
  highestRevenueAmount: number
  monthlyRevenue: AdminInstructorRevenuePoint[]
}

export interface AdminInstructorCertificateItem {
  id: string
  title: string
  organization: string
  issueDate: string
  imageUrl: string
}

export interface AdminInstructorCertificates {
  totalCertificates: number
  items: AdminInstructorCertificateItem[]
}

export interface AdminInstructorSummaryResult {
  profile: AdminInstructorProfile
  metrics: AdminInstructorMetrics
  learnersSnapshot: AdminInstructorLearnersSnapshot
  revenueSnapshot: AdminInstructorRevenueSnapshot
  personalCertificates: AdminInstructorCertificates
}

export interface AdminInstructorCourseItem {
  id: string
  title: string
  category: string
  studentsCount: number
  revenue: number
  rating: number
  status: string
}

export interface AdminInstructorCoursesResult {
  items: AdminInstructorCourseItem[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
  hasNext: boolean
}
