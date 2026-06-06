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
          <header className='flex h-16 items-center border-b bg-background/80 px-4 shadow-sm backdrop-blur-sm sm:px-6'>
            <SidebarTrigger />
            <div className='ml-3 flex flex-1 items-center justify-between sm:ml-4'>
              <h1 className='bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 bg-clip-text text-lg font-bold text-transparent sm:text-2xl'>
                {' '}
                Quản trị hệ thống
              </h1>
            </div>
          </header>
          <main className='flex-1 min-h-0 overflow-x-hidden overflow-y-auto overscroll-contain bg-slate-50/60 p-3 sm:p-4 lg:p-6'>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}

export default AdminLayout
