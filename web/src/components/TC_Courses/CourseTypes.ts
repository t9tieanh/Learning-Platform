export type CourseStatus = 'active' | 'pending' | 'closed'

export interface Course {
  id: number
  title: string
  tags: string[]
  duration: string
  students: number
  createdAt: string
  image: string
  status: CourseStatus
}
