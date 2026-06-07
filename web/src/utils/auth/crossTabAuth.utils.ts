export const AUTH_STORAGE_KEY = 'user-storage'

export type PersistedAuthData = {
  accessToken: string
  refreshToken: string
  userId: string
  name?: string
  username?: string
  email?: string
  avatarUrl?: string
  conversationId?: string
  role?: string
  isVip?: boolean
}

export function parsePersistedAuth(raw: string | null): PersistedAuthData | null {
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw) as { state?: { data?: PersistedAuthData | null } }
    return parsed?.state?.data ?? null
  } catch {
    return null
  }
}

export function hasActiveAuthSession(data: PersistedAuthData | null | undefined): boolean {
  return Boolean(data?.accessToken)
}

/** Routes that require an authenticated session. */
export function isProtectedAuthPath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/teacher') ||
    pathname.startsWith('/me') ||
    pathname.startsWith('/chat') ||
    pathname.startsWith('/course-page')
  )
}
