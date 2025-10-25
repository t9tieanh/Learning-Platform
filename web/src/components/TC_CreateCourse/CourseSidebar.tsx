import { cn } from '@/lib/utils'
import { BookOpen, Image, DollarSign, Settings, CheckCircle } from 'lucide-react'
import { FC } from 'react'
import CourseProgressStep from '@/types/courseProgressStep'

interface SidebarItem {
  id: CourseProgressStep
  label: string
  description: string
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
    description: 'Tạo trang quảng bá khoá học của bạn',
    completed: false
  },
  {
    id: CourseProgressStep.CURRICULUM,
    label: 'Giáo trình',
    icon: BookOpen,
    description: 'Cấu trúc nội dung khoá học',
    completed: false
  },
  {
    id: CourseProgressStep.PRICING,
    label: 'Định giá',
    icon: DollarSign,
    description: 'Đặt giá và khuyến mãi cho khoá học',
    completed: false
  },
  {
    id: CourseProgressStep.SETTINGS,
    label: 'Cài đặt khoá học',
    icon: Settings,
    description: 'Cấu hình cài đặt và chính sách khoá học',
    completed: false
  }
]

const CourseSidebar: FC<CourseSidebarProps> = ({ activeSection = CourseProgressStep.INTRO, onSectionChange }) => {
  return (
    <aside
      className='md:w-80 w-full bg-gray-950 border-r border-gray-800 overflow-y-auto text-white'
      aria-label='Course sidebar'
    >
      <div className='p-6'>
        {/* Header */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-2 items-center'>
            <Settings className='inline-block h-5 w-5 mr-1' />
            Lên kế hoạch cho khoá học
          </h2>
          <p className='text-sm text-gray-400'>Hoàn thành tất cả các mục để xuất bản khoá học</p>
        </div>

        {/* Navigation */}
        <nav className='space-y-1'>
          {sidebarItems.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange?.(item.id as CourseProgressStep)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'w-full text-left p-3 rounded-lg transition-colors group focus:outline-none focus:ring-2 focus:ring-primary/50',
                  'hover:bg-gray-800',
                  isActive && 'bg-gray-900 shadow-sm'
                )}
              >
                <div className='flex items-start space-x-3'>
                  <div className='mt-0.5 flex-shrink-0'>
                    {item.completed ? (
                      <CheckCircle className='h-5 w-5 text-green-500' aria-hidden='true' />
                    ) : (
                      <Icon
                        className={cn('h-5 w-5', isActive ? 'text-primary' : 'text-gray-400 group-hover:text-white')}
                        aria-hidden='true'
                      />
                    )}
                  </div>
                  <div className='flex-1 min-w-0'>
                    <span
                      className={cn(
                        'text-sm font-medium truncate block',
                        isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'
                      )}
                    >
                      {item.label}
                    </span>
                    <span className='text-xs text-gray-500 mt-1 leading-tight block'>{item.description}</span>
                  </div>
                </div>
              </button>
            )
          })}
        </nav>
      </div>
    </aside>
  )
}

export default CourseSidebar
