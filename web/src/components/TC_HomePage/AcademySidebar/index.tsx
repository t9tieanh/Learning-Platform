import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { BookOpen, Home, MessageSquare, FileText, LogOut, ChartColumn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate, useLocation } from 'react-router-dom'
import logo from '@/assets/images/logo1.png'
import { toast } from 'sonner'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import { cn } from '@/lib/utils'

const sidebarItems = [
  {
    category: 'TỔNG QUAN',
    items: [{ name: 'Thống kê', icon: ChartColumn, path: '/teacher' }]
  },
  {
    category: 'DANH MỤC',
    items: [
      { name: 'Khóa học', icon: BookOpen, path: '/teacher/course' },
      { name: 'Tin nhắn', icon: MessageSquare, path: '/teacher/chat/me' },
      { name: 'Bài viết', icon: FileText, path: '/teacher/blogs' },
      { name: 'Trang chủ', icon: Home, path: '/' }
    ]
  }
]

const AcademySidebar = () => {
  const { data, setData } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const displayName = data?.name || 'Giảng viên'
  const initials = (data?.name || 'GV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    const confirmed = await showConfirmToast({
      title: 'Đăng xuất',
      description: 'Bạn có chắc chắn muốn đăng xuất?'
    })
    if (confirmed) {
      setData(null)
      toast.success('Đăng xuất thành công!')
      navigate('/auth')
    }
  }
  return (
    <div className='w-full h-full bg-[#1D1D2A] flex flex-col min-w-[260px] border-r border-white/5'>
      <div className='p-8 mb-4'>
        <button onClick={() => navigate('/teacher')} className='p-0 border-none bg-transparent cursor-pointer transition-transform hover:scale-105 active:scale-95'>
          <img src={logo} alt='LEARNOVA logo' className='h-10 md:h-10 w-auto select-none object-contain' />
        </button>
      </div>

      <nav className='flex-1 px-4 text-white overflow-y-auto custom-scrollbar'>
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className='mb-10'>
            <h3 className='text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-4 px-3 opacity-60'>{section.category}</h3>
            <div className='space-y-2'>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon
                const isActive = (item.path === '/' || item.path === '/teacher')
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path)

                const onClick = () => navigate(item.path)

                return (
                  <Button
                    key={itemIndex}
                    variant='ghost'
                    className={cn(
                      'w-full justify-start h-12 px-4 rounded-[20px] transition-all duration-300 group',
                      isActive
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/10'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    )}
                    onClick={onClick}
                  >
                    <Icon className={cn('w-4.5 h-4.5 mr-3.5 transition-colors', isActive ? 'text-white' : 'group-hover:text-blue-400')} />
                    <span className='text-[13px] font-bold tracking-tight'>{item.name}</span>
                    {isActive && (
                      <div className='ml-auto w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)]' />
                    )}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className='p-6 mt-auto border-t border-white/5 bg-white/[0.02]'>
        <div className='flex items-center gap-4 group cursor-pointer p-2 rounded-2xl hover:bg-white/5 transition-all'>
          <div className='relative'>
            <Avatar className='h-11 w-11 rounded-2xl overflow-hidden border-2 border-white/10 flex items-center justify-center bg-gray-800'>
              <AvatarImage src={data?.avatarUrl} className='object-cover h-full w-full' />
              <AvatarFallback className='bg-blue-600 text-white text-[10px] font-black uppercase p-2'>{initials}</AvatarFallback>
            </Avatar>
            <div className='absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-[#1D1D2A] rounded-full shadow-lg shadow-emerald-500/20' />
          </div>

          <div className='flex-1 min-w-0'>
            <p className='text-[13px] font-black text-white truncate'>{displayName}</p>
            <p className='text-[9px] font-black text-gray-500 uppercase tracking-widest mt-0.5 opacity-60'>Giảng viên Premium</p>
          </div>

          <button
            onClick={handleLogout}
            className='p-2 text-gray-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all group-hover:bg-red-500/10'
            title='Đăng xuất'
          >
            <LogOut className='w-4.5 h-4.5' />
          </button>
        </div>
      </div>
    </div>
  )
}

export default AcademySidebar
