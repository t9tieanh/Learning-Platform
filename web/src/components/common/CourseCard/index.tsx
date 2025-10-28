import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { IoPaperPlane } from 'react-icons/io5'
import './style.scss'
import { Course } from '@/types/course.type'
import { useNavigate } from 'react-router-dom'

const CourseCard = ({ course, className }: { course: Course; className?: string }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/course/${course.id}`)
  }

  return (
    <>
      <Card className={`p-0 gap-0 course-card ${className}`} onClick={handleClick}>
        <CardHeader className='p-0'>
          <img alt='Course' className='h-48 w-full object-cover rounded-2xl' src={course.thumbnailUrl} />
        </CardHeader>
        <CardContent className='p-4 pt-1'>
          <CardTitle className='text-lg font-bold'>{course.title}</CardTitle>
          <CardDescription className='flex text-sm text-muted-foreground gap-2'>
            <p className='line-through'>{course.originalPrice} VND</p>
            <p className='text-red-500 font-bold'>{course.finalPrice} VND</p>
          </CardDescription>
          <CardDescription className='flex justify-between gap-2 mt-2'>
            <div className='flex items-center gap-2'>
              <Avatar>
                <AvatarImage src={course.instructor.image} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p>{course.instructor.name}</p>
            </div>
            <Button
              className='rounded-3xl btn-detail bg-primary hover:bg-primary-hover hover:scale-105 transition-transform duration-300 ease-in-out'
              onClick={handleClick}
            >
              <IoPaperPlane />
              Xem chi tiết
            </Button>
          </CardDescription>
        </CardContent>
      </Card>
    </>
  )
}

export default CourseCard
