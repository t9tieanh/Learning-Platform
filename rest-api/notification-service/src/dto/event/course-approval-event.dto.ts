export interface CourseApprovalEvent {
  id: string
  action: string
  reason?: string | null
  instructorId: string
  title: string
  shortDescription?: string
  longDescription?: string
  thumbnailUrl?: string
  rating?: number | null
  introductoryVideo?: string
  language?: string | null
  originalPrice?: number
  finalPrice?: number
}
