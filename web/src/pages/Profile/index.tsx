import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { User, BookOpen, FileClock, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PersonalInfo from '@/components/Profile/personal-info'
import CourseStudied from '@/components/Profile/my-course'
import OrderHistory from '@/components/Profile/orderHistory'
import CourseCertificateList from '@/components/Profile/CourseCertificateList'

const VALID_MODES = ['info', 'courses', 'cert', 'order-history'] as const
type ProfileMode = (typeof VALID_MODES)[number]

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const modeParam = searchParams.get('mode')
  const initialMode: ProfileMode =
    modeParam && VALID_MODES.includes(modeParam as ProfileMode) ? (modeParam as ProfileMode) : 'info'
  const [activeSection, setActiveSection] = useState<ProfileMode>(initialMode)

  useEffect(() => {
    const mode = searchParams.get('mode')
    if (mode && VALID_MODES.includes(mode as ProfileMode)) {
      setActiveSection(mode as ProfileMode)
    }
  }, [searchParams])

  const handleSectionChange = (id: ProfileMode) => {
    setActiveSection(id)
    setSearchParams({ mode: id })
  }

  const navigationItems = [
    {
      id: 'info' as const,
      title: 'Thông tin cá nhân',
      icon: User,
      description: 'Xem và chỉnh sửa thông tin'
    },
    {
      id: 'courses' as const,
      title: 'Khóa học của tôi',
      icon: BookOpen,
      description: 'Lịch sử học tập'
    },
    {
      id: 'cert' as const,
      title: 'Chứng chỉ khóa học',
      icon: Award,
      description: 'Chứng chỉ đã nhận'
    },
    {
      id: 'order-history' as const,
      title: 'Lịch sử đơn hàng',
      icon: FileClock,
      description: 'Xem lịch sử đơn hàng của bạn'
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'info':
        return <PersonalInfo />
      case 'courses':
        return <CourseStudied />
      case 'cert':
        return <CourseCertificateList />
      case 'order-history':
        return <OrderHistory />
      default:
        return <PersonalInfo />
    }
  }

  return (
    <div className='max-w-7xl mx-auto bg-gray-50 py-6 min-h-screen'>
      <div className='container mx-auto p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          <div className='lg:col-span-1'>
            <Card className='sticky top-6 shadow-md'>
              <CardHeader>
                <CardTitle className='text-xl bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent'>
                  Hồ sơ cá nhân
                </CardTitle>
              </CardHeader>
              <CardContent className='p-0'>
                <nav className='space-y-1'>
                  {navigationItems.map((item) => {
                    const Icon = item.icon
                    const isActive = activeSection === item.id

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleSectionChange(item.id)}
                        className={`w-full shadow-sm flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg mx-2 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className='h-5 w-5' />
                        <div>
                          <div className='font-sm text-base font-medium'>{item.title}</div>
                          <div
                            className={`text-xs ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                          >
                            {item.description}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className='lg:col-span-3'>{renderContent()}</div>
        </div>
      </div>
    </div>
  )
}

export default Profile
