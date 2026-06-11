/** How course-page lesson video URLs are fetched (frontend only). */

import { LessonVideoUrlMode } from '@/types/lesson-video.type'

/** Used when `VITE_LESSON_VIDEO_URL_MODE` is unset, empty, or invalid. */
export const DEFAULT_LESSON_VIDEO_URL_MODE = LessonVideoUrlMode.Ip

const LESSON_VIDEO_URL_MODES = new Set<string>(Object.values(LessonVideoUrlMode))

const LEGACY_LESSON_VIDEO_URL_MODE_ALIASES: Record<string, LessonVideoUrlMode> = {
  dev: LessonVideoUrlMode.BasicAuth,
  basic_auth: LessonVideoUrlMode.BasicAuth,
  cookie_nginx: LessonVideoUrlMode.CookieNginx,
  cookienginx: LessonVideoUrlMode.CookieNginx,
  production: LessonVideoUrlMode.Ip
}

function resolveLessonVideoUrlMode(): LessonVideoUrlMode {
  const raw = import.meta.env.VITE_LESSON_VIDEO_URL_MODE?.trim().toLowerCase()
  if (!raw) return DEFAULT_LESSON_VIDEO_URL_MODE
  if (LESSON_VIDEO_URL_MODES.has(raw)) return raw as LessonVideoUrlMode
  return LEGACY_LESSON_VIDEO_URL_MODE_ALIASES[raw] ?? DEFAULT_LESSON_VIDEO_URL_MODE
}

/** `BasicAuth`: Basic Auth + /dev-presigned-url. `Ip`: JWT + /presigned-url. `CookieNginx`: cookie + /media-url. */
export const lessonVideoUrlMode = resolveLessonVideoUrlMode()

/** @deprecated Use `lessonVideoUrlMode === LessonVideoUrlMode.BasicAuth` */
export const useDevLessonVideoPresignedApi = lessonVideoUrlMode === LessonVideoUrlMode.BasicAuth

export const lessonVideoDevBasicUsername =
  (import.meta.env.VITE_LESSON_VIDEO_DEV_BASIC_USERNAME as string | undefined)?.trim() ?? 'dev'

export const lessonVideoDevBasicPassword =
  (import.meta.env.VITE_LESSON_VIDEO_DEV_BASIC_PASSWORD as string | undefined)?.trim() ?? 'dev'
