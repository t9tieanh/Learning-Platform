import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { IoPaperPlane } from 'react-icons/io5'
import { Course } from '@/types/course.type'
import { useNavigate } from 'react-router-dom'
import ImageNotFound from '@/assets/images/image-not-found.png'

const CourseCard = ({ course, className }: { course: Course; className?: string }) => {
  const navigate = useNavigate()

  const handleClick = () => {
    navigate(`/course/${course.id}`)
  }

  return (
    <>
      <Card className={`p-0 gap-0 course-card group hover:shadow-lg transition-shadow duration-300 ${className}`}>
        <CardHeader className='p-0 relative overflow-hidden'>
          <img
            alt='Course'
            className='h-36 sm:h-40 md:h-48 w-full object-cover rounded-t-lg transition-transform duration-300 group-hover:scale-105'
            src={course.thumbnailUrl || ImageNotFound}
          />
        </CardHeader>
        <CardContent className='p-3 sm:p-4'>
          <CardTitle className='text-sm md:text-sm font-bold text-gray-600 line-clamp-2 min-h-[40px] mb-2'>
            {course.title}
          </CardTitle>
          <CardDescription className='flex items-center text-sm gap-2 mb-3'>
            <p className='line-through text-gray-500 text-xs sm:text-sm'>{course.originalPrice} VND</p>
            <p className='text-red-500 font-bold text-sm sm:text-base'>{course.finalPrice} VND</p>
          </CardDescription>
          <CardDescription className='flex flex-col sm:flex-row justify-between gap-3 mt-2'>
            <div className='flex items-center gap-2 min-w-0'>
              <Avatar className='w-8 h-8 sm:w-10 sm:h-10'>
                <AvatarImage src={course.instructor.image} />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <p className='text-xs sm:text-sm font-medium truncate'>{course.instructor.name}</p>
            </div>
            <Button
              className='w-full sm:w-auto rounded-full btn-detail bg-primary hover:bg-primary-hover hover:scale-105 transition-all duration-300 text-xs sm:text-sm py-2 h-auto'
              onClick={handleClick}
            >
              <IoPaperPlane className='w-4 h-4 mr-1' />
              Xem chi tiết
            </Button>
          </CardDescription>
        </CardContent>
      </Card>
    </>
  )
}

export default CourseCard
