import { LayoutDashboard, BookOpen, Users, Award, FileText, TicketPercent, LogOut } from 'lucide-react'
import { NavLink } from './NavLink'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from '@/components/ui/sidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import userService from '@/services/user/user.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import learnovaLogo from '@/assets/images/logo1.png'
import learnovaLogoCompact from '@/assets/images/LEARNOVA_sm.png'

const menuItems = [
  { title: 'Trang chủ', url: '/admin', icon: LayoutDashboard },
  { title: 'Khóa học', url: '/admin/courses', icon: BookOpen },
  { title: 'Giảng viên', url: '/admin/instructors', icon: Users },
  { title: 'Chứng chỉ', url: '/admin/certificates', icon: Award },
  { title: 'Bài viết', url: '/admin/blogs', icon: FileText },
  { title: 'Mã giảm giá', url: '/admin/discounts', icon: TicketPercent }
]

export function AdminSidebar() {
  const { open, setOpen } = useSidebar()
  const navigate = useNavigate()
  const { data, logout: logoutStore } = useAuthStore()
  const displayName = data?.name || data?.username || 'Quản trị viên'
  const initials = (displayName || 'AD')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleNavItemClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setOpen(false)
    }
  }

  const handleLogout = async () => {
    const confirmed = await showConfirmToast({
      title: 'Đăng xuất',
      description: 'Bạn có chắc chắn muốn đăng xuất?',
      confirmLabel: 'Đăng xuất',
      cancelLabel: 'Hủy'
    })
    if (!confirmed) return

    try {
      const token = useAuthStore.getState().data?.accessToken
      if (token) {
        await userService.logout()
      }
    } catch (e) {
      // optional: show error toast
    } finally {
      logoutStore()
      toast.success('Đăng xuất thành công!')
      navigate('/auth')
    }
  }

  return (
    <Sidebar
      className={`${
        open ? 'w-[82vw] max-w-72 lg:w-72' : 'w-20'
      } h-[100dvh] min-h-[100dvh] flex-shrink-0 overflow-y-auto border-r border-slate-800/80 bg-[linear-gradient(180deg,#081120_0%,#0b1528_48%,#0a1120_100%)] text-slate-100 transition-all duration-300`}
      collapsible='icon'
    >
      <SidebarContent className='flex min-h-0 flex-col'>
        <div className={open ? 'p-6 pb-0' : 'flex justify-center px-0 py-6'}>
          <div className={open ? 'mb-7' : ''}>
            <div className={`flex items-center ${open ? 'mb-5' : 'justify-center'}`}>
              <button
                type='button'
                onClick={() => navigate('/admin')}
                className='cursor-pointer border-none bg-transparent p-0 transition-transform hover:scale-105 active:scale-95'
              >
                <img
                  src={open ? learnovaLogo : learnovaLogoCompact}
                  alt='Learnova logo'
                  className='h-9 w-auto select-none object-contain'
                />
              </button>
            </div>
          </div>
        </div>

        <div className={`flex-1 py-4 ${open ? 'px-6' : 'px-3'}`}>
          <SidebarGroup className='mt-0 space-y-3'>
            {open && (
              <SidebarGroupLabel className='px-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500'>
                Điều hướng
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu className='space-y-1.5'>
                {menuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className='bg-transparent p-0 hover:bg-transparent'>
                      <NavLink
                        to={item.url}
                        end
                        onClick={handleNavItemClick}
                        className='group flex items-center rounded-2xl border border-transparent px-3 py-3 text-slate-300 transition-all duration-200 hover:border-white/10 hover:bg-white/[0.06] hover:text-white focus:outline-none'
                        activeClassName='border-white/10 bg-white/[0.1] text-white shadow-[0_16px_30px_-24px_rgba(15,23,42,0.9)]'
                      >
                        {({ isActive }) => (
                          <>
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
                                isActive
                                  ? 'border-white bg-green-900/80 text-slate-200 border-white/15 bg-white/[0.05]'
                                  : 'border-white/10 bg-slate-900/40 text-slate-400 group-hover:border-white/15 group-hover:bg-white/[0.05] group-hover:text-slate-200'
                              }`}
                            >
                              <item.icon className='h-4.5 w-4.5' />
                            </div>
                            {open && (
                              <div className='ml-3 min-w-0 flex-1'>
                                <span className='block truncate text-sm font-medium'>{item.title}</span>
                              </div>
                            )}
                          </>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <div className={`mt-auto border-t border-gray-800 bg-gray-900/20 ${open ? 'p-6' : 'p-3'}`}>
          {open ? (
            <div className='flex items-center gap-3'>
              <Avatar className='h-11 w-11 shrink-0 border border-gray-700'>
                <AvatarImage className='object-cover' src={data?.avatarUrl} alt='' />
                <AvatarFallback className='bg-gray-800 text-xs font-bold text-white'>{initials}</AvatarFallback>
              </Avatar>
              <div className='min-w-0 flex-1'>
                <p className='truncate text-[13px] font-black text-white'>{displayName}</p>
                <p className='mt-0.5 text-[10px] font-medium text-gray-500'>Quản trị viên</p>
              </div>
              <button
                type='button'
                onClick={handleLogout}
                className='shrink-0 rounded-xl bg-gray-800 p-2.5 text-gray-400 transition-colors hover:bg-red-900/30 hover:text-red-400'
                title='Đăng xuất'
              >
                <LogOut className='h-4 w-4' aria-hidden />
              </button>
            </div>
          ) : (
            <div className='flex flex-col items-center gap-2'>
              <Avatar className='h-9 w-9 shrink-0 border border-gray-700'>
                <AvatarImage className='object-cover' src={data?.avatarUrl} alt='' />
                <AvatarFallback className='bg-gray-800 text-[10px] font-bold text-white'>{initials}</AvatarFallback>
              </Avatar>
              <button
                type='button'
                onClick={handleLogout}
                className='shrink-0 rounded-xl bg-gray-800 p-2.5 text-gray-400 transition-colors hover:bg-red-900/30 hover:text-red-400'
                title='Đăng xuất'
              >
                <LogOut className='h-4 w-4' aria-hidden />
              </button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
