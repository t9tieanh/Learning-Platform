export interface CertificateIssuedEvent {
  userId: string
  userName: string
  email: string
  courseId?: string | null
  courseTitle?: string | null
  courseThumbnailUrl?: string | null
  certificateId?: string | null
  certificateCode?: string | null
  courseScore?: number | null
  courseScoreTotal?: number | null
  profileUrl?: string | null
  courseUrl?: string | null
  certificatePdfBase64?: string | null
  certificatePdfFilename?: string | null
}
