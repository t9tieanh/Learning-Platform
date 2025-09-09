import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar'
import { BookOpen, Calendar, Home, MessageSquare, BarChart3, HelpCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
  return (
    <div className='w-64 h-screen bg-[#1D1D2A] text-sidebar-foreground flex flex-col'>
      <div className='flex p-6 items-center gap-3'>
        <Avatar>
          <AvatarImage
            className='w-8 h-8 rounded-full'
            src='https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/React-icon.svg/2300px-React-icon.svg.png'
          />
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>
        <span className='text-xl font-semibold text-white'>Academy</span>
      </div>

      <nav className='flex-1 px-4 text-white'>
        {sidebarItems.map((section, sectionIndex) => (
          <div key={sectionIndex} className='mb-6'>
            <h3 className='text-xs font-semibold text-sidebar-foreground/60 mb-3 px-2'>{section.category}</h3>
            <div className='space-y-1'>
              {section.items.map((item, itemIndex) => {
                const Icon = item.icon
                return (
                  <Button
                    key={itemIndex}
                    variant={item.active ? 'secondary' : 'ghost'}
                    className={`w-full justify-start h-11 px-3 ${
                      item.active
                        ? 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-[#ababaf]'
                        : 'text-sidebar-foreground/80 hover:bg-[#afafb3] hover:text-sidebar-accent-foreground'
                    }`}
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

      <div className='p-4 border-t border-sidebar-border text-white'>
        <div className='flex items-center gap-3'>
          <Avatar>
            <AvatarImage
              className='rounded-full h-12 w-12'
              src='https://images.vexels.com/media/users/3/145908/raw/52eabf633ca6414e60a7677b0b917d92-male-avatar-maker.jpg'
            />
            <AvatarFallback className='bg-primary text-white'>AS</AvatarFallback>
          </Avatar>

          <div className='flex-1'>
            <p className='text-base font-semibold'>Anh Sang</p>
            <p className='text-sm text-sidebar-foreground/60'>Giáo viên</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AcademySidebar
