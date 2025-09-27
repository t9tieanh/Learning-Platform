import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { BookOpen, Calendar, Home, MessageSquare, BarChart3, HelpCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'

const sidebarItems = [
  {
    category: 'TỔNG QUAN',
    items: [
      { name: 'Trang chủ', icon: Home, active: true },
      { name: 'Lịch', icon: Calendar, active: true }
    ]
  },
  {
    category: 'DANH MỤC',
    items: [
      { name: 'Khóa học', icon: BookOpen, active: true },
      { name: 'Tin nhắn', icon: MessageSquare, active: true },
      { name: 'Thống kê', icon: BarChart3, active: true },
      { name: 'Hỗ trợ', icon: HelpCircle, active: true },
      { name: 'Cài đặt', icon: Settings, active: true }
    ]
  }
]

const AcademySidebar = () => {
  const { data } = useAuthStore()
  const navigate = useNavigate()
  const displayName = data?.name || 'Giảng viên'
  const initials = (data?.name || 'GV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
  return (
    <div
      className='w-64 h-screen bg-[#1D1D2A] text-sidebar-foreground flex flex-col
  min-w-[220px] max-w-full
  fixed lg:static top-0 left-0 z-40
  transition-transform duration-300
  lg:translate-x-0 translate-x-0
  '
    >
      <div className='flex p-4 md:p-6 items-center gap-3'>
        <Avatar>
          <AvatarImage
            className='w-8 h-8 rounded-full'
            src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png'
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className='text-lg md:text-xl font-semibold text-white'>Academy</span>
      </div>

      <nav className='flex-1 px-2 md:px-4 text-white'>
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className='mb-6'>
            <h3 className='text-xs font-semibold text-sidebar-foreground/60 mb-3 px-2'>{section.category}</h3>
            <div className='space-y-1'>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon
                let onClick = undefined
                if (item.name === 'Trang chủ') onClick = () => navigate('/teacher')
                if (item.name === 'Khóa học') onClick = () => navigate('/teacher/course')
                return (
                  <Button
                    key={itemIndex}
                    variant={item.active ? 'secondary' : 'ghost'}
                    className={`w-full justify-start h-11 px-3 ${
                      item.active
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
            <AvatarFallback className='bg-primary text-white'>{initials}</AvatarFallback>
          </Avatar>

          <div className='flex-1'>
            <p className='text-base font-semibold truncate'>{displayName}</p>
            <p className='text-xs md:text-sm text-sidebar-foreground/60'>Giảng viên</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcademySidebar
