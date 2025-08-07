import { Card, CardContent, CardHeader } from '@/components/ui/card'
import './style.scss'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const TeacherInfo = () => {
  return (
    <Card className='mx-auto teacher-info-card max-w-7xl p-1 max-w-md border-none shadow-sm'>
      <CardContent className='flex items-center gap-2'>
        <Avatar>
          <AvatarImage
            src='https://i.pravatar.cc/150?img=3'
            alt='Teacher'
            className='w-full h-full object-cover rounded-full'
          />
          <AvatarFallback className='text-2xl'>TA</AvatarFallback>
        </Avatar>
        <div>
          <p className='text-base font-semibold'>Phạm Tiến Anh</p>
          <p className='text-sm text-gray-600'>
            Frontend Developer & Instructor
          </p>
        </div>
        <hr />
      </CardContent>
    </Card>
  )
}

export default TeacherInfo
