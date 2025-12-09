import { FC, useEffect } from 'react'
import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthenticationGate from '@/components/auth-gate/AuthenticationGate'
import { useAuthStore } from '@/stores/useAuth.stores'

import { toast } from 'sonner'

const TC_Layout: FC = () => {
  const { data } = useAuthStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!data) {
      toast.error('Vui lòng đăng nhập để truy cập trang giảng viên.')
      navigate('/auth')
    }
  }, [])
  return (
    <AuthenticationGate>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 transition-colors'>
        {/* Sidebar */}
        <div className='fixed top-0 left-0 h-screen w-64 bg-[#1D1D2A] z-30'>
          <AcademySidebar />
        </div>

        {/* Main content */}
        <div className='ml-64 space-y-6'>
          <Outlet />
        </div>
      </div>
    </AuthenticationGate>
  )
}

export default TC_Layout
