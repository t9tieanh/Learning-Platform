import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { BookOpen, Home, MessageSquare, FileText, LogOut, ChartColumn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'
import logo from '@/assets/images/logo1.png'
import { toast } from 'sonner'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'

const sidebarItems = [
  {
    category: 'TỔNG QUAN',
    items: [
      { name: 'Thống kê', icon: ChartColumn, active: true }
    ]
  },
  {
    category: 'DANH MỤC',
    items: [
      { name: 'Khóa học', icon: BookOpen, active: true },
      { name: 'Tin nhắn', icon: MessageSquare, active: true },
      { name: 'Bài viết', icon: FileText, active: true },
      { name: 'Trang chủ', icon: Home, active: false }
    ]
  }
]

const AcademySidebar = () => {
  const { data, setData } = useAuthStore()
  const navigate = useNavigate()
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
    <div
      className='w-full h-full bg-[#1D1D2A] text-sidebar-foreground flex flex-col min-w-[220px]'
    >
      <div className='flex p-4 md:p-6 items-center gap-3'>
        <button onClick={() => navigate('/teacher')} className='p-0 border-none bg-transparent cursor-pointer'>
          <img src={logo} alt='LEARNOVA logo' className='h-12 md:h-8 w-auto select-none object-contain' />
        </button>
      </div>

      <nav className='flex-1 px-2 md:px-4 text-white'>
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className='mb-6'>
            <h3 className='text-xs font-semibold text-sidebar-foreground/60 mb-3 px-2'>{section.category}</h3>
            <div className='space-y-1'>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon
                let onClick = undefined
                if (item.name === 'Thống kê') onClick = () => navigate('/teacher')
                if (item.name === 'Quay lại') onClick = () => navigate('/')
                if (item.name === 'Khóa học') onClick = () => navigate('/teacher/course')
                if (item.name === 'Tin nhắn') onClick = () => navigate('/teacher/chat/:id')
                if (item.name === 'Bài viết') onClick = () => navigate('/teacher/blogs')
                return (
                  <Button
                    key={itemIndex}
                    variant={item.active ? 'secondary' : 'ghost'}
                    className={`w-full justify-start h-11 px-3 ${item.active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-[#ababaf]'
                        : 'text-sidebar-foreground/80 hover:bg-[#afafb3] hover:text-sidebar-accent-foreground'
                      }`}
                    onClick={onClick}
                  >
                    <Icon className='w-5 h-5 mr-3' />
                    {item.name}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className='p-2 md:p-4 border-t border-sidebar-border text-white'>
        <div className='flex items-center gap-2 md:gap-3'>
          <Avatar>
            <AvatarImage className='rounded-full h-10 w-10 md:h-12 md:w-12' src={data?.avatarUrl} />
            <AvatarFallback className='text-white'>{initials}</AvatarFallback>
          </Avatar>

          <div className='flex-1'>
            <p className='text-base font-semibold truncate'>{displayName}</p>
            <p className='text-xs md:text-sm text-sidebar-foreground/60'>Giảng viên</p>
          </div>

          <Button
            variant='ghost'
            size='icon'
            onClick={handleLogout}
            className='text-red-400 hover:bg-red-500/10 hover:text-red-500'
            title='Đăng xuất'
          >
            <LogOut className='w-5 h-5' />
          </Button>
        </div>
      </div>
    </div>
  )
}

export default AcademySidebar
