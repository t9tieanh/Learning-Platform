import { useRef } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CustomButton from '@/components/common/Button'
import { Mail, Phone, Calendar, User, Camera } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { FaUserEdit } from 'react-icons/fa'
import { useAuthStore } from '@/stores/useAuth.stores'

const PersonalInfo = () => {
  const { data } = useAuthStore()
  const infoTabs = [
    { label: 'Điện thoại', icon: <Phone className='w-4 h-4 text-primary' />, value: '' },
    { label: 'Email', icon: <Mail className='w-4 h-4 text-primary' />, value: data?.email || '' },
    { label: 'Tên đăng nhập', icon: <User className='w-4 h-4 text-primary' />, value: data?.username || '' },
    { label: 'Ngày tham gia', icon: <Calendar className='w-4 h-4 text-primary' />, value: '' }
  ]

  // Trigger file picker and handle avatar change (logic to be implemented later)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const handleAvatarChange = () => {
    // TODO: Implement avatar upload/change logic here
  }

  return (
    <div className='space-y-6 shadow-sm rounded-xl'>
      <Card className='hover:bg-profile-card-hover transition-colors rounded-xl shadow-md'>
        <CardContent className='px-8'>
          <div className='flex gap-4 items-center text-center mb-8 px-4 py-6 rounded-xl bg-[#0C356A]'>
            <div className='relative'>
              <button
                type='button'
                className='group relative block rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50'
                onClick={() => fileInputRef.current?.click()}
                aria-label='Chọn ảnh đại diện mới'
              >
                <Avatar className='h-28 w-28 shadow-lg cursor-pointer'>
                  <AvatarImage src={data?.avatarUrl} alt={data?.name} className='object-cover' />
                  <AvatarFallback className='text-lg font-semibold bg-primary text-primary-foreground'>
                    <User className='h-6 w-6' />
                  </AvatarFallback>
                </Avatar>
                <div className='pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100'>
                  <Camera className='w-6 h-6 text-white' />
                </div>
              </button>
              <input
                ref={fileInputRef}
                id='avatarUpload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={() => handleAvatarChange()}
              />
            </div>
            <div>
              <h3 className='text-3xl font-bold flex text-blue-500'>{data?.name}</h3>
              <p className='text-sm text-white text-start'>@{data?.username}</p>
            </div>
          </div>

          {/* Info Grid */}
          <h2 className='font-semibold text-base my-4'>Thông tin cơ bản</h2>
          <div className='grid gap-4 md:grid-cols-2'>
            {infoTabs.map((tab, index) => (
              <div
                key={index}
                className='flex items-center border-2 gap-3 p-4 rounded-lg bg-white hover:bg-blue-100 transition-colors'
              >
                <div className='p-2 rounded-md bg-primary/10'>{tab.icon}</div>
                <div>
                  <div className='text-sm font-medium text-muted-foreground'>{tab.label}</div>
                  <div className='text-foreground text-sm font-sm'>{tab.value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className='flex justify-end mt-8'>
            <CustomButton
              className='hover:bg-primary-hover shadow-lg hover:scale-105'
              label='Chỉnh sửa'
              icon={<FaUserEdit className='h-5 w-5' />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default PersonalInfo
