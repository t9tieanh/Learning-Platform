import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, BookOpen } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface Teacher {
  id: string
  name: string
  image: string
  phone: string
  description: string
  email: string
  username: string | null
  numCourse: number
  expertise: {
    id: string
    name: string
    image: string
  }[]
  certificates: {
    id: string
    title: string
    organization: string
    imageUrl: string
    credentialUrl: string
  }[]
}

const TeacherInfo = ({ teacher }: { teacher: Teacher }) => {
  const navigate = useNavigate()
  return (
    <Card className='ml-12 border-none'>
      <CardContent className='p-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Teacher Avatar and Basic Info */}
          <div
            className='flex flex-col items-center md:items-start gap-4 md:w-1/3 cursor-pointer'
            onClick={() => navigate(`/instructor/${teacher.id}`)}
          >
            <Avatar className='w-20 h-20 shadow-lg'>
              <AvatarImage src={teacher?.image} alt={teacher?.name} />
              <AvatarFallback className='text-2xl font-semibold bg-gradient-primary text-primary-foreground'>
                {teacher?.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </AvatarFallback>
            </Avatar>

            <div className='text-center md:text-left'>
              <h3 className='text-xl font-bold text-foreground'>{teacher?.name}</h3>
              <p className='text-primary text-base font-medium'>@{teacher?.username}</p>
            </div>

            <div className='grid grid-cols-2 gap-4 w-full'>
              <div className='text-center p-3 bg-muted/30 rounded-lg'>
                <div className='flex items-center justify-center gap-1 text-primary mb-1'>
                  {React.createElement(Star, { className: 'w-4 h-4 fill-current' })}
                  <span className='font-semibold'>5</span>
                </div>
                <p className='text-xs text-muted-foreground'>Đánh giá</p>
              </div>
              <div className='text-center p-3 bg-muted/30 rounded-lg'>
                <div className='flex items-center justify-center gap-1 text-primary mb-1'>
                  {React.createElement(BookOpen, { className: 'w-4 h-4' })}
                  <span className='font-semibold'>{teacher?.numCourse}</span>
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
              <p className='text-muted-foreground leading-relaxed text-base text-justify'>{teacher?.description}</p>
            </div>
            <div>
              <h4 className='font-semibold text-foreground mb-3'>Chuyên môn</h4>
              <div className='flex flex-wrap gap-2'>
                {teacher?.expertise?.map((skill, index) => (
                  <Badge
                    key={index}
                    variant='secondary'
                    className='bg-white shadow-lg text-black p-1 px-2 hover:bg-primary/20'
                  >
                    <Avatar className='w-20 h-20 w-6 h-6 mr-2'>
                      <AvatarImage src={skill?.image} alt={skill?.name} />
                      <AvatarFallback className='text-2xl font-semibold bg-gradient-primary text-primary-foreground'>
                        {skill?.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>{skill.name}</div>
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <h4 className='font-semibold text-foreground mb-3'>Chứng chỉ</h4>
              <div className='flex flex-wrap gap-2'>
                {teacher?.certificates?.map((certificate, index) => (
                  <a key={index} href={certificate?.credentialUrl} target='_blank' rel='noopener noreferrer'>
                    <Badge variant='secondary' className='bg-white shadow-lg text-black p-1 px-2 hover:bg-primary/20'>
                      <Avatar className='w-20 h-20 w-6 h-6 mr-2'>
                        <AvatarImage src={certificate?.imageUrl} alt={certificate?.title} />
                        <AvatarFallback className='text-2xl font-semibold bg-gradient-primary text-primary-foreground'>
                          {certificate?.title
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>{certificate.title}</div>
                    </Badge>
                  </a>
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
