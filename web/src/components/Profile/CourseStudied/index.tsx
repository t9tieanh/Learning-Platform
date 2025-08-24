import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowRight } from 'lucide-react'

const courses = [
  {
    title: 'Khóa học React Advanced',
    progress: 85,
    status: 'Đang học',
    startDate: '2024-01-15',
    instructor: 'Nguyễn Minh Tuấn',
    image: 'https://files.fullstack.edu.vn/f8-prod/courses/21/63e1bcbaed1dd.png',
    link: '/courses/react-advanced'
  },
  {
    title: 'JavaScript Fundamentals',
    progress: 100,
    status: 'Hoàn thành',
    startDate: '2023-11-20',
    instructor: 'Trần Thị Lan',
    image: 'https://files.fullstack.edu.vn/f8-prod/courses/21/63e1bcbaed1dd.png',
    link: '/courses/js-fundamentals'
  },
  {
    title: 'TypeScript cho Beginners',
    progress: 60,
    status: 'Đang học',
    startDate: '2024-02-01',
    instructor: 'Lê Văn Đức',
    image: 'https://files.fullstack.edu.vn/f8-prod/courses/21/63e1bcbaed1dd.png',
    link: '/courses/ts-beginners'
  }
]

const CourseStudied = () => {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <h2 className='text-base font-semibold text-white bg-gradient-to-r from-primary to-purple-600 px-6 py-3 rounded-2xl shadow-lg tracking-tight'>
          Khóa học đã học
        </h2>
      </div>

      <div className='grid gap-4'>
        {courses.map((course, index) => (
          <Card key={index} className='hover:bg-profile-card-hover transition-colors rounded-xl overflow-hidden'>
            <div className='flex flex-col md:flex-row'>
              {/* Ảnh khoá học */}
              <div className='md:w-1/4 w-full h-40 md:h-auto ml-6'>
                <img src={course.image} alt={course.title} className='object-cover w-full h-full rounded-lg' />
              </div>

              {/* Nội dung */}
              <div className='flex-1 flex flex-col justify-between'>
                <CardHeader className='pb-2 flex justify-between items-start'>
                  <CardTitle className='text-xl'>{course.title}</CardTitle>
                  <Badge
                    variant={course.status === 'Hoàn thành' ? 'default' : 'secondary'}
                    className={
                      course.status === 'Hoàn thành'
                        ? 'bg-green-500 p-2 text-white rounded-xl border-2 border-gray-500'
                        : 'p-2 bg-orange-500 rounded-xl border-gray-500'
                    }
                  >
                    {course.status}
                  </Badge>
                </CardHeader>

                <CardDescription className='ml-6 text-gray-500 text-base mt-1 mb-1'>
                  Giảng viên: {course.instructor}
                </CardDescription>

                <CardContent className='space-y-2'>
                  <div className='flex justify-between text-sm'>
                    <span>Tiến độ</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} />
                </CardContent>

                <CardFooter className='flex justify-between items-center'>
                  <p className='text-sm text-muted-foreground'>
                    Bắt đầu: {new Date(course.startDate).toLocaleDateString('vi-VN')}
                  </p>
                  <Button size='sm' className='mt-4 rounded-xl p-5 hover:bg-primary-hover hover:scale-105' asChild>
                    <a href={course.link}>
                      Vào học
                      <ArrowRight className='w-4 h-4' />
                    </a>
                  </Button>
                </CardFooter>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

export default CourseStudied
