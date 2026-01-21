import { FC, useEffect, useState } from 'react'
import AcademySidebar from '@/components/TC_HomePage/AcademySidebar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'
import { Outlet, useNavigate } from 'react-router-dom'
import AuthenticationGate from '@/components/auth-gate/AuthenticationGate'
import { useAuthStore } from '@/stores/useAuth.stores'
import { toast } from 'sonner'

const TC_Layout: FC = () => {
  const { data } = useAuthStore()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!data) {
      toast.error('Vui lòng đăng nhập để truy cập trang giảng viên.')
      navigate('/auth')
    }
  }, [])

  return (
    <AuthenticationGate>
      <div className='flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-950 transition-colors'>
        {/* Desktop Sidebar - hidden on mobile */}
        <div className='hidden lg:block fixed top-0 left-0 h-screen w-64 bg-[#1D1D2A] z-30'>
          <AcademySidebar />
        </div>

        {/* Mobile Sidebar - Sheet */}
        <div className='lg:hidden fixed top-4 left-4 z-50'>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant='outline' size='icon' className='bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700'>
                <Menu className='h-5 w-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='left' className='p-0 w-64 border-r-0 bg-[#1D1D2A] text-white'>
              <AcademySidebar />
            </SheetContent>
          </Sheet>
        </div>

        {/* Main content */}
        <div className='flex-1 lg:ml-64 w-full'>
          <Outlet />
        </div>
      </div>
    </AuthenticationGate>
  )
}

export default TC_Layout
