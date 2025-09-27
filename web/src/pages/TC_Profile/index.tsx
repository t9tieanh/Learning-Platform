import TeacherProfile from '@/components/TC_Profile'
import { useState } from 'react'
import CustomButton from '@/components/common/Button'

const TC_Profile = () => {
  // Sample teacher data with state management
  const [teacher, setTeacher] = useState({
    id: '1',
    name: 'Dr. Sarah Chen',
    username: 'sarahchen',
    email: 'sarah.chen@academy.edu',
    phone: '+1 (555) 123-4567',
    avatar: '', // Will use initials
    specialization: 'Computer Science & AI',
    date: '20/09/2025'
  })

  const handleUpdateTeacher = (updatedTeacher: typeof teacher) => {
    setTeacher(updatedTeacher)
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b border-border bg-card'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center gap-3'>
            <CustomButton>Back</CustomButton>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='mb-8'>
            <h1 className='text-2xl font-bold text-foreground mb-2'>Hồ sơ giảng viên</h1>
            <p className='text-muted-foreground text-base'>Thông tin cá nhân và liên hệ của giảng viên</p>
          </div>

          <TeacherProfile teacher={teacher} onUpdateTeacher={handleUpdateTeacher} />
        </div>
      </main>
    </div>
  )
}

export default TC_Profile
