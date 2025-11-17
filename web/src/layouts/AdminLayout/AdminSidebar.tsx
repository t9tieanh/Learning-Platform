import { LayoutDashboard, BookOpen, Users, Award, FileText } from 'lucide-react'
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

const menuItems = [
  { title: 'Dashboard', url: '/admin', icon: LayoutDashboard },
  { title: 'Khóa học', url: '/admin/courses', icon: BookOpen },
  { title: 'Giảng viên', url: '/admin/instructors', icon: Users },
  { title: 'Chứng chỉ', url: '/admin/certificates', icon: Award },
  { title: 'Blog', url: '/admin/blogs', icon: FileText }
]

export function AdminSidebar() {
  const { open } = useSidebar()

  return (
    <Sidebar
      className={`${
        open ? 'w-64' : 'w-16'
      } h-screen flex-shrink-0 overflow-y-auto bg-[#0d0d0d] border-r border-gray-800 text-gray-200 transition-all duration-300`}
      collapsible='icon'
    >
      <SidebarContent>
        {/* Header */}
        <div className='px-6 py-5 border-b border-gray-800 bg-[#0d0d0d]/90'>
          {open ? (
            <div className='flex items-center gap-3'>
              <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-purple-600/30'>
                E
              </div>
              <h2 className='text-xl font-semibold tracking-wide text-white'>EduAdmin</h2>
            </div>
          ) : (
            <div className='h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-extrabold shadow-lg shadow-purple-600/30 mx-auto'>
              E
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
                            className={`h-5 w-5 transition-colors duration-200 ${
                              isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-blue-400'
                            }`}
                          />
                          {open && <span className='ml-3 font-medium'>{item.title}</span>}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
