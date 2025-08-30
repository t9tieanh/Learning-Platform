import { Card, CardContent, CardHeader } from '@/components/ui/card'
import './style.scss'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { BadgeCheckIcon } from 'lucide-react'

const TeacherInfo = () => {
  return (
    <Card className='mx-auto ml-12 mt-3 teacher-info-card border-none shadow-sm p-3 border-gray-500'>
      <CardHeader className='flex items-center gap-2'>
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
          <p className='text-sm text-gray-600'>Frontend Developer & Instructor</p>
          <Badge variant='secondary' className='bg-blue-500 text-white dark:bg-blue-600'>
            <BadgeCheckIcon />
            Verified
          </Badge>
        </div>
        <hr />
      </CardHeader>
      <CardContent className='text-sm text-gray-700'>
        <p className='mb-2 font-medium text-gray-700'>
          Phạm Tiến Anh là một giảng viên giàu kinh nghiệm trong lĩnh vực phát triển web, chuyên về React và các công
          nghệ frontend hiện đại. Với hơn 5 năm kinh nghiệm giảng dạy và phát triển phần mềm, anh đã giúp hàng nghìn học
          viên nắm vững kiến thức và kỹ năng cần thiết để thành công trong ngành công nghiệp công nghệ.
        </p>
        <span className='font-medium text-blue-500'>Xem chi tiết</span>
      </CardContent>
    </Card>
  )
}

export default TeacherInfo
