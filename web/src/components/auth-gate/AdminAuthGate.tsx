import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuth.stores'
import { getHomePathForRole, hasAdminRole } from '@/utils/auth/adminRole.utils'
import { hasActiveAuthSession } from '@/utils/auth/crossTabAuth.utils'

const AdminAuthGate = ({ children }: { children: ReactNode }) => {
  const { data } = useAuthStore()
  const location = useLocation()

  if (!hasActiveAuthSession(data)) {
    return <Navigate to='/auth' replace state={{ from: location.pathname }} />
  }

  if (!hasAdminRole(data?.role)) {
    return <Navigate to={getHomePathForRole(data?.role)} replace />
  }

  return <>{children}</>
}

export default AdminAuthGate
