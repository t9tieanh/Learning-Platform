import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { IoPaperPlane } from 'react-icons/io5'
import './style.scss'

interface Course {
  id: number
  title: string
  price: string
  image: string
}

const CourseCard = ({ course }: { course: Course }) => {
  return (
    <>
      <Card className='p-0 gap-0'>
        <CardHeader className='p-0'>
          <img alt='Course' className='h-48 w-full object-cover rounded-2xl' src={course.image} />
        </CardHeader>
        <CardContent className='p-4 pt-1'>
          <CardTitle className='text-lg font-bold'>{course.title}</CardTitle>
          <CardDescription className='flex text-sm text-muted-foreground gap-2'>
            <p className='line-through'>{course.price}</p>
            <p className='text-red-500 font-bold'>{course.price}</p>
          </CardDescription>
          <CardDescription className='flex justify-between gap-2 mt-2'>
            <div className='flex items-center gap-2'>
              <Avatar>
                <AvatarImage src='https://github.com/shadcn.png' />
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              Phạm Tiến Anh
            </div>
            <Button className='rounded-3xl btn-detail'>
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
