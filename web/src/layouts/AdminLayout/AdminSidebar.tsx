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
import userService from '@/services/user/user.service'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

const menuItems = [
  { title: 'Trang chủ', url: '/admin', icon: LayoutDashboard },
  { title: 'Khóa học', url: '/admin/courses', icon: BookOpen },
  { title: 'Giảng viên', url: '/admin/instructors', icon: Users },
  { title: 'Chứng chỉ', url: '/admin/certificates', icon: Award },
  { title: 'Bài viết', url: '/admin/blogs', icon: FileText },
  { title: 'Mã giảm giá', url: '/admin/discounts', icon: TicketPercent }
]

export function AdminSidebar() {
  const { open } = useSidebar()
  const navigate = useNavigate()
  const logoutStore = useAuthStore((s) => s.logout)

  const handleLogout = async () => {
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
        open ? 'w-72' : 'w-20'
      } h-[100dvh] min-h-[100dvh] flex-shrink-0 overflow-y-auto border-r border-slate-800/80 bg-[linear-gradient(180deg,#081120_0%,#0b1528_48%,#0a1120_100%)] text-slate-100 transition-all duration-300`}
      collapsible='icon'
    >
      <SidebarContent>
        <div
          className={`border-b border-white/10 px-4 py-5 ${
            open ? '' : 'flex justify-center px-0'
          } bg-white/[0.02] backdrop-blur-xl`}
        >
          {open ? (
            <div className='rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.75)]'>
              <div className='flex items-center gap-3'>
                <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500 text-sm font-extrabold text-white shadow-[0_18px_30px_-18px_rgba(56,189,248,0.8)]'>
                  N
                </div>
                <div className='min-w-0'>
                  <p className='text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-400'>Admin panel</p>
                  <h2 className='mt-1 text-lg font-semibold tracking-tight text-white'>NovaAdmin</h2>
                </div>
              </div>
            </div>
          ) : (
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 via-cyan-400 to-blue-500 text-sm font-extrabold text-white shadow-[0_18px_30px_-18px_rgba(56,189,248,0.8)]'>
              N
            </div>
          )}
        </div>

        <div className='flex flex-1 flex-col justify-between px-3 py-4'>
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

          <div className='pt-4'>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className='group flex w-full items-center rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-3 text-slate-300 transition-all duration-200 hover:border-rose-400/20 hover:bg-rose-500/10 hover:text-rose-100'
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-slate-900/40 text-slate-400 transition-colors group-hover:border-rose-400/20 group-hover:bg-rose-500/10 group-hover:text-rose-200'>
                    <LogOut className='h-4.5 w-4.5' />
                  </div>
                  {open && <span className='ml-3 text-sm font-medium'>Đăng xuất</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
