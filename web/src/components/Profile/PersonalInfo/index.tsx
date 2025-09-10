import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CustomButton from '@/components/common/Button'
import { Mail, Phone, MapPin, Calendar, Edit3, Save, X, User, BookAudio } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { FaUserEdit } from 'react-icons/fa'

interface UserInfo {
  name: string
  email: string
  phone: string
  location: string
  avatar: string
}

const PersonalInfo = () => {
  const [userInfo] = useState<UserInfo>({
    name: 'Nguyễn Đức Sang',
    email: 'ndsang321@email.com',
    phone: '0123456789',
    location: 'Hà Nội, Việt Nam',
    avatar: 'https://jbagy.me/wp-content/uploads/2025/03/Hinh-anh-anime-chibi-nam-ngau-2.jpg'
  })

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h2 className='text-base flex align-items-center font-semibold text-white bg-gradient-to-r from-primary to-purple-600 px-6 py-3 rounded-2xl shadow-lg tracking-tight'>
          <User className='mr-2' size={20} /> Thông tin cá nhân
        </h2>
      </div>

      {/* Card */}
      <Card className='border-border bg-profile-card hover:bg-profile-card-hover transition-colors rounded-xl shadow-md'>
        <CardContent className='p-8'>
          {/* Avatar + Name */}
          <div className='flex flex-col items-center text-center space-y-4 mb-8'>
            <Avatar className='h-28 w-28 border-2 border-primary'>
              <AvatarImage src={userInfo.avatar} alt={userInfo.name} className='object-cover' />
              <AvatarFallback className='text-lg font-semibold bg-primary text-primary-foreground'>
                <User className='h-6 w-6' />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className='text-2xl font-semibold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent'>
                {userInfo.name}
              </h3>
            </div>
          </div>

          {/* Info Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6 pl-4'>
            <div>
              <Label className='flex items-center gap-2 text-sm font-medium text-gray-500'>
                <Mail className='h-4 w-4 text-primary' /> Email
              </Label>
              <p className='text-base font-medium'>{userInfo.email}</p>
            </div>

            <div>
              <Label className='flex items-center gap-2 text-sm font-medium text-gray-500'>
                <Phone className='h-4 w-4 text-primary' /> Số điện thoại
              </Label>
              <p className='text-base font-medium'>{userInfo.phone}</p>
            </div>

            <div>
              <Label className='flex items-center gap-2 text-sm font-medium text-gray-500'>
                <MapPin className='h-4 w-4 text-primary' /> Địa chỉ
              </Label>
              <p className='text-base font-medium'>{userInfo.location}</p>
            </div>

            <div>
              <Label className='flex items-center gap-2 text-sm font-medium text-gray-500'>
                <BookAudio className='h-4 w-4 text-primary' /> Khóa học
              </Label>
              <p className='text-base font-medium'>2</p>
            </div>
          </div>

          <div className='flex justify-end mt-8'>
            <CustomButton
              className='rounded-lg hover:bg-primary-hover hover:scale-105'
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
