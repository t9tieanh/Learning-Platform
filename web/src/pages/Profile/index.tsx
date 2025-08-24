import { useState } from 'react'
import { User, Settings, BookOpen } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PersonalInfo from '@/components/Profile/PersonalInfo'
import AccountSetting from '@/components/Profile/AccountSetting'
import CourseStudied from '@/components/Profile/CourseStudied'

type ProfileSection = 'info' | 'settings' | 'courses'

const Profile = () => {
  const [activeSection, setActiveSection] = useState<ProfileSection>('info')

  const navigationItems = [
    {
      id: 'info' as ProfileSection,
      title: 'Thông tin cá nhân',
      icon: User,
      description: 'Xem và chỉnh sửa thông tin'
    },
    {
      id: 'settings' as ProfileSection,
      title: 'Cài đặt',
      icon: Settings,
      description: 'Tùy chỉnh tài khoản'
    },
    {
      id: 'courses' as ProfileSection,
      title: 'Khóa học đã học',
      icon: BookOpen,
      description: 'Lịch sử học tập'
    }
  ]

  const renderContent = () => {
    switch (activeSection) {
      case 'info':
        return <PersonalInfo />
      case 'settings':
        return <AccountSetting />
      case 'courses':
        return <CourseStudied />
      default:
        return <PersonalInfo />
    }
  }

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='container mx-auto p-6'>
        <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
          {/* Navigation Sidebar */}
          <div className='lg:col-span-1'>
            <Card className='border-border sticky top-6'>
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
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors rounded-lg mx-2 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className='h-5 w-5' />
                        <div>
                          <div className='font-base'>{item.title}</div>
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
