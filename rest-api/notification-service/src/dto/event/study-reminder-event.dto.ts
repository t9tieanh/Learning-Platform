export interface StudyReminderCourseItem {
  courseId: string
  title: string
  thumbnailUrl?: string | null
  progress?: number | null
  courseUrl: string
}

export interface StudyReminderEvent {
  userId: string
  userName: string
  email: string
  courses: StudyReminderCourseItem[]
}
