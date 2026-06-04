import { CourseApprovalAction } from '~/enums/courseApprovalAction.enum'

export { CourseApprovalAction }

export interface CourseApprovalTagDto {
  id: string
  name: string
  imageUrl?: string
}

export interface CourseApprovalEvent {
  id: string
  action: CourseApprovalAction
  reason?: string | null
  instructorId: string
  title: string
  shortDescription?: string
  longDescription?: string
  thumbnailUrl?: string
  rating?: number | null
  introductoryVideo?: string
  language?: string | null
  originalPrice?: number | null
  finalPrice?: number | null
  tags?: CourseApprovalTagDto[]
  categoryName?: string | null
  instructorName?: string | null
}
