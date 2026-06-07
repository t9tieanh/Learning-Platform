import type { LessonType } from '@/types/course.type'

interface LessonTypeHints {
  url?: string | null
  content?: string | null
}

const ARTICLE_EXTENSIONS = /\.(pdf|doc|docx|ppt|pptx|txt)(\?|$)/i
const VIDEO_EXTENSIONS = /\.(mp4|webm|m3u8|mov|avi|mkv)(\?|$)/i

/** Normalizes backend lesson type; infers from URL when type is missing. */
export function normalizeLessonType(
  raw?: string | null,
  hints?: LessonTypeHints
): LessonType {
  const normalized = String(raw ?? '').toLowerCase().trim()

  if (normalized === 'article' || normalized === 'document' || normalized === 'pdf') {
    return 'article'
  }
  if (normalized === 'video') return 'video'
  if (normalized === 'quiz') return 'quiz'

  const url = (hints?.url ?? '').toLowerCase()

  if (ARTICLE_EXTENSIONS.test(url)) return 'article'
  if (VIDEO_EXTENSIONS.test(url)) return 'video'

  if (hints?.content?.trim() && !url) return 'article'

  return url ? 'video' : 'article'
}

export function lessonTypeLabel(type: LessonType | string): string {
  const normalized = typeof type === 'string' && !['video', 'article', 'quiz'].includes(type)
    ? normalizeLessonType(type)
    : (type as LessonType)

  if (normalized === 'article') return 'Bài viết'
  if (normalized === 'quiz') return 'Trắc nghiệm'
  return 'Video'
}
