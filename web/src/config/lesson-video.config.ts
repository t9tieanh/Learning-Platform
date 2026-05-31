/** How course-page lesson video URLs are fetched (frontend only). */

export type LessonVideoUrlMode = 'production' | 'dev'

/** Used when `VITE_LESSON_VIDEO_URL_MODE` is unset, empty, or not `dev`. */
export const DEFAULT_LESSON_VIDEO_URL_MODE: LessonVideoUrlMode = 'production'

function resolveLessonVideoUrlMode(): LessonVideoUrlMode {
  const raw = import.meta.env.VITE_LESSON_VIDEO_URL_MODE?.trim()
  if (!raw) {
    return DEFAULT_LESSON_VIDEO_URL_MODE
  }
  return raw.toLowerCase() === 'dev' ? 'dev' : DEFAULT_LESSON_VIDEO_URL_MODE
}

/** `production`: JWT + /presigned-url (CloudFront with IP). `dev`: Basic Auth + /dev-presigned-url (no IP). */
export const lessonVideoUrlMode: LessonVideoUrlMode = resolveLessonVideoUrlMode()

export const useDevLessonVideoPresignedApi = lessonVideoUrlMode === 'dev'

export const lessonVideoDevBasicUsername =
  (import.meta.env.VITE_LESSON_VIDEO_DEV_BASIC_USERNAME as string | undefined)?.trim() ?? 'dev'

export const lessonVideoDevBasicPassword =
  (import.meta.env.VITE_LESSON_VIDEO_DEV_BASIC_PASSWORD as string | undefined)?.trim() ?? 'dev'
