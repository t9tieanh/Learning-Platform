export interface DataAdminHome {
  courseCnt: number
  instructorCnt: number
  certificateCnt: number
  blogCnt: number
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
