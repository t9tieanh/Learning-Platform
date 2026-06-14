import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuth.stores'
import { hasAdminRole, isAdminSitePath } from '@/utils/auth/adminRole.utils'
import { hasActiveAuthSession } from '@/utils/auth/crossTabAuth.utils'

/** Logged-in admins may only browse `/admin/*`; other routes redirect to the admin dashboard. */
const AdminSiteRestrictionGate = ({ children }: { children: ReactNode }) => {
  const { data } = useAuthStore()
  const location = useLocation()

  const isAdminSession = hasActiveAuthSession(data) && hasAdminRole(data?.role)

  if (isAdminSession && !isAdminSitePath(location.pathname)) {
    return <Navigate to='/admin' replace state={{ from: location.pathname }} />
  }

  return <>{children}</>
}

export default AdminSiteRestrictionGate
