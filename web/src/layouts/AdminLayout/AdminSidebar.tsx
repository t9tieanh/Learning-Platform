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
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
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
        await userService.logout(token)
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
      className={`${open ? 'w-64' : 'w-16'
        } h-screen flex-shrink-0 overflow-y-auto bg-[#0d0d0d] border-r border-gray-800 text-gray-200 transition-all duration-300`}
      collapsible='icon'
    >
      <SidebarContent>
        {/* Header */}
        <div
          className={`border-b border-gray-800 bg-[#0d0d0d]/90 py-5 ${open ? 'px-6' : 'px-0 flex justify-center'
            }`}
        >
          {open ? (
            <div className='flex items-center gap-3'>
              <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-blue-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-purple-600/30'>
                N
              </div>
              <h2 className='text-xl font-semibold tracking-wide text-white'>NovaAdmin</h2>
            </div>
          ) : (
            <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-[#2DD4BF] to-blue-500 flex items-center justify-center text-white font-extrabold shadow-lg shadow-purple-600/30'>
              N
            </div>
          )}
        </div>

        {/* Menu */}
        <SidebarGroup>
          {open && (
            <SidebarGroupLabel className='text-gray-400 uppercase text-xs tracking-wider px-4 mt-3 mb-1'>
              Quản lý
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className='flex items-center px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none text-gray-300 hover:text-blue-400 hover:bg-blue-900/20 focus:text-blue-600 focus:bg-blue-100'
                      activeClassName='text-blue-600 bg-black font-semibold'
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={`h-5 w-5 transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-400'
                              }`}
                          />
                          {open && <span className='ml-3 font-medium'>{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              {/* Logout button */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleLogout}
                  className='flex items-center px-4 py-3 rounded-lg transition-all duration-200 focus:outline-none text-gray-300 hover:text-red-400 hover:bg-red-900/20'
                >
                  <LogOut className='h-5 w-5 text-gray-400' />
                  {open && <span className='ml-3 font-medium'>Đăng xuất</span>}
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
