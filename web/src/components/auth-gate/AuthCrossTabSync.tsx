import { useContext, useEffect } from 'react'
import { toast } from 'sonner'
import { SocketContext } from '@/api/socket/socket.context'
import { useAuthStore } from '@/stores/useAuth.stores'
import {
  AUTH_STORAGE_KEY,
  hasActiveAuthSession,
  isProtectedAuthPath,
  parsePersistedAuth,
} from '@/utils/auth/crossTabAuth.utils'

/** Sync auth state across browser tabs via persisted localStorage. */
export default function AuthCrossTabSync() {
  const logout = useAuthStore((s) => s.logout)
  const setData = useAuthStore((s) => s.setData)
  const { disconnectSocket } = useContext(SocketContext)

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key !== AUTH_STORAGE_KEY) return

      const remoteAuth = parsePersistedAuth(event.newValue)
      const localAuth = useAuthStore.getState().data
      const hadSession = hasActiveAuthSession(localAuth)
      const remoteHasSession = hasActiveAuthSession(remoteAuth)

      if (!remoteHasSession && hadSession) {
        logout()
        disconnectSocket()

        if (isProtectedAuthPath(window.location.pathname)) {
          toast.info('Phiên đăng nhập đã kết thúc.')
          window.location.assign('/auth')
        }
        return
      }

      if (
        remoteHasSession &&
        remoteAuth &&
        remoteAuth.accessToken !== localAuth?.accessToken
      ) {
        setData(remoteAuth)
      }
    }

    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [disconnectSocket, logout, setData])

  return null
}
