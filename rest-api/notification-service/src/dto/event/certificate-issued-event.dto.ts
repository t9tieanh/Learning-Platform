export interface CertificateIssuedEvent {
  userId: string
  userName: string
  email: string
  courseId?: string | null
  courseTitle?: string | null
  courseThumbnailUrl?: string | null
  certificateId?: string | null
  certificateCode?: string | null
  profileUrl?: string | null
  courseUrl?: string | null
}
