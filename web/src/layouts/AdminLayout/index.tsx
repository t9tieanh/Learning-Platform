import { Outlet } from 'react-router-dom'
import { useEffect } from 'react'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from './AdminSidebar'

const AdminLayout: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add('admin-scroll-lock')
    document.body.classList.add('admin-scroll-lock')

    return () => {
      document.documentElement.classList.remove('admin-scroll-lock')
      document.body.classList.remove('admin-scroll-lock')
    }
  }, [])

  return (
    <SidebarProvider>
      <div className='flex h-[100dvh] min-h-[100dvh] w-full overflow-hidden bg-gradient-to-br from-background via-muted/20 to-background'>
        <AdminSidebar />
        <div className='flex-1 flex flex-col min-h-0'>
          <header className='h-16 border-b bg-background/80 backdrop-blur-sm flex items-center px-6 shadow-sm'>
            <SidebarTrigger />
            <div className='ml-4 flex items-center justify-between flex-1'>
              <h1 className='text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent'>
                Quản trị hệ thống
              </h1>
            </div>
          </header>
          <main className='flex-1 min-h-0 overflow-y-auto overscroll-contain bg-slate-50/60 p-6'>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout
