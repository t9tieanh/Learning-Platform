import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, Home, MessageSquare, FileText, LogOut, ChartColumn } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useLocation, useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo1.png'
import { toast } from 'sonner'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

type NavItem = {
  name: string
  icon: LucideIcon
  match: (pathname: string) => boolean
  to: string
}

const navSections: { category: string; items: NavItem[] }[] = [
  {
    category: 'Tổng quan',
    items: [
      {
        name: 'Trang chủ',
        icon: Home,
        match: (p) => p === '/teacher' || p === '/teacher/',
        to: '/teacher',
      },
    ],
  },
  {
    category: 'Danh mục',
    items: [
      {
        name: 'Khóa học',
        icon: BookOpen,
        match: (p) => p === '/teacher/course' || p.startsWith('/teacher/course-details'),
        to: '/teacher/course',
      },
      {
        name: 'Tin nhắn',
        icon: MessageSquare,
        match: (p) => p.startsWith('/teacher/chat'),
        to: '/teacher/chat',
      },
      {
        name: 'Bài viết',
        icon: FileText,
        match: (p) =>
          p.startsWith('/teacher/blogs') ||
          p.startsWith('/teacher/blog') ||
          p.startsWith('/teacher/create-blog') ||
          p.startsWith('/teacher/update-blog'),
        to: '/teacher/blogs',
      },
      {
        name: 'Thống kê',
        icon: ChartColumn,
        match: (p) => p.startsWith('/teacher/statistics'),
        to: '/teacher/statistics',
      },
    ],
  },
]

const AcademySidebar = () => {
  const { pathname } = useLocation()
  const { data, setData } = useAuthStore()
  const navigate = useNavigate()
  const displayName = data?.name || 'Giảng viên'
  const initials = (data?.name || 'GV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleLogout = async () => {
    const confirmed = await showConfirmToast({
      title: 'Đăng xuất',
      description: 'Bạn có chắc chắn muốn đăng xuất?',
    })
    if (confirmed) {
      setData(null)
      toast.success('Đăng xuất thành công!')
      navigate('/auth')
    }
  }

  return (
    <aside
      className='w-full h-full min-h-0 bg-[#1D1D2A] border-r border-gray-800 overflow-y-auto flex flex-col transition-all duration-500 text-white'
      aria-label='Teacher sidebar'
    >
      <div className='p-6 flex-1 flex flex-col'>
        <div className='mb-7'>
          <div className='flex mb-5 items-center justify-between'>
            <button
              type='button'
              onClick={() => navigate('/')}
              className='p-0 border-none bg-transparent cursor-pointer transition-transform hover:scale-105 active:scale-95'
            >
              <img src={logo} alt='LEARNOVA logo' className='h-9 w-auto select-none object-contain' />
            </button>
          </div>
        </div>

        <nav className='space-y-6 flex-1'>
          {navSections.map((section) => (
            <div key={section.category}>
              <h3 className='text-[10px] font-bold tracking-wider text-gray-500 mb-3 px-1'>
                {section.category}
              </h3>
              <div className='space-y-1'>
                {section.items.map((item) => {
                  const Icon = item.icon
                  const isActive = item.match(pathname)

                  return (
                    <button
                      key={item.name}
                      type='button'
                      onClick={() => navigate(item.to)}
                      aria-current={isActive ? 'page' : undefined}
                      className={cn(
                        'w-full text-left p-4 rounded-[24px] transition-all duration-300 group relative overflow-hidden',
                        isActive
                          ? 'bg-gray-900 text-white shadow-lg scale-[1.02]'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:pl-5'
                      )}
                    >
                      <div className='flex items-center gap-4'>
                        <span
                          className={cn(
                            'flex-shrink-0 p-2.5 rounded-xl transition-all inline-flex',
                            isActive
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-800 text-gray-500 group-hover:bg-blue-600 group-hover:text-white'
                          )}
                          aria-hidden
                        >
                          <Icon className='h-4 w-4' />
                        </span>
                        <span className='flex-1 min-w-0'>
                          <span
                            className={cn(
                              'text-[13px] font-black transition-colors truncate block',
                              isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                            )}
                          >
                            {item.name}
                          </span>
                        </span>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      <div className='p-6 mt-auto border-t border-gray-800 bg-gray-900/20'>
        <div className='flex items-center gap-3'>
          <Avatar className='h-11 w-11 shrink-0 border border-gray-700'>
            <AvatarImage className='object-cover' src={data?.avatarUrl} alt='' />
            <AvatarFallback className='bg-gray-800 text-white text-xs font-bold'>{initials}</AvatarFallback>
          </Avatar>
          <div className='flex-1 min-w-0'>
            <p className='text-[13px] font-black text-white truncate'>{displayName}</p>
            <p className='text-[10px] font-medium text-gray-500 mt-0.5'>Giảng viên</p>
          </div>
          <button
            type='button'
            onClick={handleLogout}
            className='shrink-0 p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors'
            title='Đăng xuất'
          >
            <LogOut className='h-4 w-4' aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default AcademySidebar
