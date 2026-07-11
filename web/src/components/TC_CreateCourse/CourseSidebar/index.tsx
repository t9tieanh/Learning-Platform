import { cn } from '@/lib/utils'
import { BookOpen, Image, DollarSign, Settings, CheckCircle, LogOut } from 'lucide-react'
import { FC } from 'react'
import CourseProgressStep from '@/types/courseProgressStep'
import { useNavigate } from 'react-router-dom'
import { showConfirmToast } from '@/components/common/ShowConfirmToast'
import { useAuthStore } from '@/stores/useAuth.stores'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import logo from '@/assets/images/logo1.png'

interface SidebarItem {
  id: CourseProgressStep | 'BACK'
  label: string
  icon: FC<{ className?: string }>
  completed?: boolean
}

interface CourseSidebarProps {
  activeSection?: CourseProgressStep
  onSectionChange?: (section: CourseProgressStep) => void
}

const sidebarItems: SidebarItem[] = [
  {
    id: CourseProgressStep.INTRO,
    label: 'Trang giới thiệu khoá học',
    icon: Image,
    completed: false
  },
  {
    id: CourseProgressStep.CURRICULUM,
    label: 'Giáo trình',
    icon: BookOpen,
    completed: false
  },
  {
    id: CourseProgressStep.PRICING,
    label: 'Định giá',
    icon: DollarSign,
    completed: false
  },
  {
    id: CourseProgressStep.SETTINGS,
    label: 'Cài đặt khoá học',
    icon: Settings,
    completed: false
  }
]

const CourseSidebar: FC<CourseSidebarProps> = ({ activeSection = CourseProgressStep.INTRO, onSectionChange }) => {
  const navigate = useNavigate()
  const { data } = useAuthStore()

  const displayName = data?.name || 'Giảng viên'
  const initials = (data?.name || 'GV')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const handleOnclick = (item: SidebarItem) => {
    if (item.id === 'BACK') {
      showConfirmToast({
        title: 'Bạn có chắc chắn muốn quay lại?',
        description: 'Những thay đổi chưa lưu có thể bị mất.',
        confirmLabel: 'Quay lại',
        cancelLabel: 'Hủy'
      }).then((confirmed: boolean) => {
        if (confirmed) {
          navigate(-1)
        }
      })
    } else {
      onSectionChange?.(item.id as CourseProgressStep)
    }
  }

  const handleExit = async () => {
    const confirmed = await showConfirmToast({
      title: 'Bạn có chắc chắn muốn thoát ra?',
      description: 'Những thay đổi chưa lưu có thể bị mất.',
      confirmLabel: 'Thoát ra',
      cancelLabel: 'Hủy'
    })
    if (confirmed) {
      navigate(-1)
    }
  }

  return (
    <aside
      className='md:w-80 w-full h-full bg-[#1D1D2A] border-r border-gray-800 overflow-y-auto flex flex-col transition-all duration-500'
      aria-label='Course sidebar'
    >
      <div className='p-6 flex-1'>
        {/* Header */}
        <div className='mb-10'>
          <div className='flex mb-8 items-center justify-between'>
            <button onClick={() => navigate('/teacher')} className='p-0 border-none bg-transparent cursor-pointer transition-transform hover:scale-105 active:scale-95'>
              <img src={logo} alt='LEARNOVA logo' className='h-10 md:h-10 w-auto select-none object-contain' />
            </button>
          </div>
          <div className='space-y-1.5'>
            <h2 className='text-[15px] font-black text-white tracking-tight flex items-center gap-2'>
              Lên kế hoạch khóa học
            </h2>
            <p className='text-[11px] font-medium text-gray-500 leading-relaxed'>Hoàn thành các đề mục để sẵn sàng xuất bản khóa học của bạn.</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className='space-y-1 flex-1'>
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                onClick={() => handleOnclick(item)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full text-left p-4 rounded-[24px] transition-all duration-300 group relative mb-3 overflow-hidden',
                  isActive
                    ? 'bg-gray-900 text-white shadow-lg scale-[1.02]'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white hover:pl-6'
                )}
              >
                <div className='flex items-center space-x-4'>
                  <div className={cn(
                    'flex-shrink-0 p-2.5 rounded-xl transition-all',
                    isActive ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-500 group-hover:bg-blue-600 group-hover:text-white'
                  )}>
                    {item.completed ? (
                      <CheckCircle className='h-4 w-4' aria-hidden='true' />
                    ) : (
                      <Icon className='h-4 w-4' aria-hidden='true' />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <span className={cn(
                      'text-[13px] font-black transition-colors truncate block',
                      isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                    )}>
                      {item.label}
                    </span>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>

      {/* User Footer */}
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
            onClick={handleExit}
            className='shrink-0 p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:bg-red-900/30 hover:text-red-400 transition-colors'
            title='Thoát ra'
          >
            <LogOut className='h-4 w-4' aria-hidden />
          </button>
        </div>
      </div>
    </aside>
  )
}

export default CourseSidebar
