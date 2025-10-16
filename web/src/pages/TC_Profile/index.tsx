import TeacherProfile from '@/components/TC_Profile'
import { useEffect, useMemo, useState } from 'react'
import CustomButton from '@/components/common/Button'
import { useAuthStore } from '@/stores/useAuth.stores'
import { useNavigate } from 'react-router-dom'

const TC_Profile = () => {
  const { data } = useAuthStore()
  const navigate = useNavigate()
  // Local teacher type aligned with component (avatar optional)
  type PageTeacher = {
    id: string
    name: string
    username: string
    email: string
    phone: string
    avatar?: string
    specialization?: string
    date?: string
  }

  // Map store user to teacher shape
  const initialTeacher: PageTeacher = useMemo(
    () => ({
      id: 'current',
      name: data?.name || 'Giảng viên',
      username: data?.username || 'teacher',
      email: data?.email || '',
      phone: '',
      avatar: data?.avatarUrl || undefined,
      specialization: 'Giảng dạy',
      date: new Date().toLocaleDateString('vi-VN')
    }),
    [data]
  ) as PageTeacher
  const [teacher, setTeacher] = useState<PageTeacher>(initialTeacher)

  useEffect(() => {
    setTeacher(initialTeacher)
  }, [initialTeacher])

  const handleUpdateTeacher = (updatedTeacher: PageTeacher) => {
    setTeacher(updatedTeacher)
  }

  return (
    <div className='min-h-screen bg-background'>
      {/* Header */}
      <header className='border-b border-border bg-card'>
        <div className='container mx-auto px-6 py-4'>
          <div className='flex items-center gap-3'>
            <CustomButton onClick={() => navigate('/teacher')}>Quay lại</CustomButton>
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
