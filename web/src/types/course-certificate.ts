export interface RecipientSnapshot {
  userId: string
  name: string
}

export interface CourseSnapshot {
  courseId: string
  title: string
  thumbnailUrl?: string | null
  instructorId: string
  instructorName: string
  instructorAvatarUrl?: string | null
}

export type CertificateStatus = 'ISSUED'

export interface CourseCompletionCertificate {
  id: string
  certificateCode: string
  issuedAt: string
  completedAt: string
  status: CertificateStatus
  recipientSnapshot: RecipientSnapshot
  courseSnapshot: CourseSnapshot
}

export interface CertificateVerifyResult {
  valid: boolean
  certificateCode: string
  issuedAt: string
  recipientSnapshot: RecipientSnapshot
  courseSnapshot: CourseSnapshot
}
