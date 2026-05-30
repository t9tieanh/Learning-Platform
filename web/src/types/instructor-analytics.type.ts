export interface MonthlyLearnerItem {
  month: number
  studentCount: number
}

export interface LearnerAnalytics {
  instructorId: string
  year: number
  totalStudentsInYear: number
  newStudentsCurrentMonth: number
  newStudentsTrendPercent: number
  monthlyStudents: MonthlyLearnerItem[]
}
