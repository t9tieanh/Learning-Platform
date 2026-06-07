/** Mirrors course-service `EnumCourseStatus`. */
export enum CourseStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  PUBLISHED = 'PUBLISHED',
  REJECTED = 'REJECTED',
  ARCHIVED = 'ARCHIVED',
}

export const COURSE_STATUS_VALUES = Object.values(CourseStatus) as CourseStatus[]

export function normalizeCourseStatus(raw?: string | null): CourseStatus | null {
  if (!raw?.trim()) return null

  const normalized = raw.trim().toUpperCase()
  if (COURSE_STATUS_VALUES.includes(normalized as CourseStatus)) {
    return normalized as CourseStatus
  }

  return null
}

export function courseStatusLabel(raw?: string | null): string {
  switch (normalizeCourseStatus(raw)) {
    case CourseStatus.DRAFT:
      return 'Bản nháp'
    case CourseStatus.PENDING_REVIEW:
      return 'Chờ duyệt'
    case CourseStatus.PUBLISHED:
      return 'Đã xuất bản'
    case CourseStatus.REJECTED:
      return 'Bị từ chối'
    case CourseStatus.ARCHIVED:
      return 'Đã lưu trữ'
    default:
      return raw?.trim().replace(/_/g, ' ') || 'Bản nháp'
  }
}

export function courseStatusBadgeClass(raw?: string | null): string {
  switch (normalizeCourseStatus(raw)) {
    case CourseStatus.DRAFT:
      return 'border-slate-200 bg-slate-100 text-slate-700'
    case CourseStatus.PENDING_REVIEW:
      return 'border-amber-200 bg-amber-50 text-amber-700'
    case CourseStatus.PUBLISHED:
      return 'border-emerald-200 bg-emerald-50 text-emerald-700'
    case CourseStatus.REJECTED:
      return 'border-rose-200 bg-rose-50 text-rose-700'
    case CourseStatus.ARCHIVED:
      return 'border-zinc-300 bg-zinc-100 text-zinc-700'
    default:
      return 'border-slate-200 bg-slate-100 text-slate-700'
  }
}
