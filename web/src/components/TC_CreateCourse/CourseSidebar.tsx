import { cn } from '@/lib/utils'
import { BookOpen, Image, DollarSign, Settings, CheckCircle } from 'lucide-react'
import { FC } from 'react'

interface SidebarItem {
  id: string
  label: string
  description: string
  icon: FC<{ className?: string }>
  completed?: boolean
}

interface CourseSidebarProps {
  activeSection?: string
  onSectionChange?: (section: string) => void
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'landing',
    label: 'Trang giới thiệu khoá học',
    icon: Image,
    description: 'Tạo trang quảng bá khoá học của bạn',
    completed: false
  },
  {
    id: 'curriculum',
    label: 'Giáo trình',
    icon: BookOpen,
    description: 'Cấu trúc nội dung khoá học',
    completed: false
  },
  {
    id: 'pricing',
    label: 'Định giá',
    icon: DollarSign,
    description: 'Đặt giá và khuyến mãi cho khoá học',
    completed: false
  },
  {
    id: 'setup',
    label: 'Cài đặt khoá học',
    icon: Settings,
    description: 'Cấu hình cài đặt và chính sách khoá học',
    completed: false
  }
]

const CourseSidebar: FC<CourseSidebarProps> = ({ activeSection = 'landing', onSectionChange }) => {
  const completedCount = sidebarItems.filter((i) => i.completed).length

  return (
    <aside
      className='md:w-80 w-full bg-gray-950 border-r border-gray-800 h-[calc(100vh-var(--header-height))] overflow-y-auto text-white'
      aria-label='Course sidebar'
    >
      <div className='p-6'>
        {/* Header */}
        <div className='mb-6'>
          <h2 className='text-lg font-semibold mb-2'>Lên kế hoạch cho khoá học</h2>
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
                onClick={() => onSectionChange?.(item.id)}
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

        {/* Progress */}
        <div className='mt-8 p-4 bg-gray-900 rounded-lg border border-gray-800'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-white'>Tiến độ khoá học</span>
            <span className='text-xs text-gray-400'>
              {completedCount}/{sidebarItems.length} đã hoàn thành
            </span>
          </div>
          <div className='w-full bg-gray-800 rounded-full h-2 overflow-hidden'>
            <div
              className='bg-primary h-2 rounded-full transition-all duration-300'
              style={{ width: `${(completedCount / sidebarItems.length) * 100}%` }}
              aria-valuemin={0}
              aria-valuemax={sidebarItems.length}
              aria-valuenow={completedCount}
              role='progressbar'
            />
          </div>
        </div>
      </div>
    </aside>
  )
}

export default CourseSidebar
