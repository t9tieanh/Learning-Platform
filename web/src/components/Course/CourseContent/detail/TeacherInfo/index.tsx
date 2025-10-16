import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, BookOpen } from 'lucide-react'

const TeacherInfo = () => {
  const teacher = {
    name: 'Nguyễn Văn An',
    title: 'Senior Full-Stack Developer',
    avatar:
      'https://img.freepik.com/free-photo/portrait-smiling-charming-young-man-grey-t-shirt-standing-against-plain-background_23-2148213406.jpg',
    rating: 4.9,
    courses: 8,
    bio: 'Với hơn 5 năm kinh nghiệm trong lĩnh vực phát triển web, tôi đã tham gia xây dựng nhiều ứng dụng quy mô lớn cho các doanh nghiệp hàng đầu. Tôi đam mê chia sẻ kiến thức và giúp đỡ các developer trẻ phát triển sự nghiệp.',
    skills: ['React', 'Node.js', 'TypeScript', 'Python', 'AWS', 'Docker']
  }

  return (
    <Card className='ml-12'>
      <CardContent className='p-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Teacher Avatar and Basic Info */}
          <div className='flex flex-col items-center md:items-start gap-4 md:w-1/3'>
            <Avatar className='w-20 h-20 ring-4 ring-primary/20'>
              <AvatarImage src={teacher.avatar} alt={teacher.name} />
              <AvatarFallback className='text-2xl font-semibold bg-gradient-primary text-primary-foreground'>
                {teacher.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className='text-center md:text-left'>
              <h3 className='text-xl font-bold text-foreground'>{teacher.name}</h3>
              <p className='text-primary text-base font-medium'>{teacher.title}</p>
            </div>

            <div className='grid grid-cols-2 gap-4 w-full'>
              <div className='text-center p-3 bg-muted/30 rounded-lg'>
                <div className='flex items-center justify-center gap-1 text-primary mb-1'>
                  {React.createElement(Star, { className: 'w-4 h-4 fill-current' })}
                  <span className='font-semibold'>{teacher.rating}</span>
                </div>
                <p className='text-xs text-muted-foreground'>Đánh giá</p>
              </div>
              <div className='text-center p-3 bg-muted/30 rounded-lg'>
                <div className='flex items-center justify-center gap-1 text-primary mb-1'>
                  {React.createElement(BookOpen, { className: 'w-4 h-4' })}
                  <span className='font-semibold'>{teacher.courses}</span>
                </div>
                <p className='text-xs text-muted-foreground'>Khóa học</p>
              </div>
            </div>
          </div>

          {/* Teacher Details */}
          <div className='md:w-2/3 space-y-6'>
            {/* Bio */}
            <div>
              <h4 className='font-semibold text-foreground mb-3'>Giới thiệu</h4>
              <p className='text-muted-foreground leading-relaxed text-base text-justify'>{teacher.bio}</p>
            </div>

            {/* Skills */}
            <div>
              <h4 className='font-semibold text-foreground mb-3'>Chuyên môn</h4>
              <div className='flex flex-wrap gap-2'>
                {teacher.skills.map((skill, index) => (
                  <Badge key={index} variant='secondary' className='bg-primary/10 text-primary hover:bg-primary/20'>
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TeacherInfo
