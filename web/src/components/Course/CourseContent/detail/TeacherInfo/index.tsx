/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Star, BookOpen, ChevronDown, ChevronUp } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const EXPERTISE_VISIBLE_LIMIT = 10
const EMPTY_DESCRIPTION = 'Giảng viên chưa cập nhật phần giới thiệu.'
const EMPTY_EXPERTISE = 'Chưa có thông tin chuyên môn.'
const EMPTY_CERTIFICATES = 'Chưa có chứng chỉ được cập nhật.'

const stripHtml = (value?: string) =>
  value
    ?.replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .trim() ?? ''

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
  const [expertiseExpanded, setExpertiseExpanded] = useState(false)
  const expertiseList = teacher?.expertise ?? []
  const certificatesList = teacher?.certificates ?? []
  const hasDescription = Boolean(stripHtml(teacher?.description))
  const hasExpertise = expertiseList.length > 0
  const hasCertificates = certificatesList.length > 0
  const hasMoreExpertise = expertiseList.length > EXPERTISE_VISIBLE_LIMIT
  const visibleExpertise =
    expertiseExpanded || !hasMoreExpertise ? expertiseList : expertiseList.slice(0, EXPERTISE_VISIBLE_LIMIT)

  return (
    <Card className='ml-0 md:ml-20 border-none'>
      <CardContent className='p-6'>
        <div className='flex flex-col md:flex-row gap-6'>
          {/* Teacher Avatar and Basic Info */}
          <div className='flex flex-col items-center md:items-start gap-4 md:w-1/3'>
            <div className='rounded-full bg-gradient-to-br from-[#17EAD9] to-[#1FA2FF] p-[3px] shadow-md shadow-[#1FA2FF]/20'>
              <Avatar className='h-20 w-20 border-2 border-white shadow-inner'>
                <AvatarImage src={teacher?.image} alt={teacher?.name} className='object-cover' />
                <AvatarFallback className='bg-gradient-to-br from-[#17EAD9] to-[#1FA2FF] text-lg font-semibold text-white'>
                  {teacher?.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </div>

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
            <Button
              type='button'
              className='w-full rounded-full bg-blue-600 text-white hover:bg-blue-700'
              onClick={() => navigate(`/instructors/${teacher?.id}/courses`)}
            >
              Xem tất cả khóa học
            </Button>
          </div>

          {/* Teacher Details */}
          <div className='md:w-2/3 space-y-6'>
            {/* Bio */}
            <div>
              <h4 className='font-semibold text-foreground mb-3'>Giới thiệu</h4>
              <p className='text-muted-foreground leading-relaxed text-base'>
                {hasDescription ? (
                  <span dangerouslySetInnerHTML={{ __html: teacher?.description }} />
                ) : (
                  EMPTY_DESCRIPTION
                )}
              </p>
            </div>
            <div>
              <h4 className='font-semibold text-foreground mb-3'>Chuyên môn</h4>
              {hasExpertise ? (
                <div className='flex flex-wrap gap-2'>
                  {visibleExpertise.map((skill) => (
                    <Badge
                      key={skill.id}
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
              ) : (
                <p className='text-muted-foreground leading-relaxed text-base'>{EMPTY_EXPERTISE}</p>
              )}
              {hasMoreExpertise && (
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  className='mt-2 h-8 px-2 text-primary hover:text-primary hover:bg-primary/10'
                  onClick={() => setExpertiseExpanded((prev) => !prev)}
                >
                  {expertiseExpanded ? (
                    <>
                      Thu gọn
                      <ChevronUp className='ml-1 h-4 w-4' />
                    </>
                  ) : (
                    <>
                      Xem thêm ({expertiseList.length - EXPERTISE_VISIBLE_LIMIT})
                      <ChevronDown className='ml-1 h-4 w-4' />
                    </>
                  )}
                </Button>
              )}
            </div>
            <div>
              <h4 className='font-semibold text-foreground mb-3'>Chứng chỉ</h4>
              {hasCertificates ? (
                <div className='flex flex-wrap gap-2'>
                  {certificatesList.map((certificate, index) => (
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
              ) : (
                <p className='text-muted-foreground leading-relaxed text-base'>{EMPTY_CERTIFICATES}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default TeacherInfo
