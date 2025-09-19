import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Layers } from 'lucide-react'

const courses = [
  {
    name: 'NodeJS',
    type: 'Backend',
    status: 'Hoạt động',
    progress: 70
  },
  {
    name: 'NodeJS',
    type: 'Backend',
    status: 'Hoạt động',
    progress: 70
  },
  {
    name: 'NodeJS',
    type: 'Backend',
    status: 'Hoạt động',
    progress: 70
  },
  {
    name: 'NodeJS',
    type: 'Backend',
    status: 'Hoạt động',
    progress: 70
  },
  {
    name: 'NodeJS',
    type: 'Backend',
    status: 'Hoạt động',
    progress: 70
  }
]

const CourseTable = () => {
  return (
    <Card className='shadow-lg  mb-8'>
      <CardHeader>
        <CardTitle className='flex items-center gap-1 md:gap-2 text-base md:text-lg'>
          <BookOpen className='text-dashboard-primary' size={18} md:size={22} />
          Khóa học của bạn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-2 md:space-y-3'>
          {/* Headers */}
          <div className='grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 py-2 text-xs md:text-sm font-semibold text-dashboard-primary border-b border-dashboard-primary/10 bg-dashboard-primary/5 rounded-lg'>
            <div className='flex items-center gap-1'>
              <Layers className='text-dashboard-primary w-3 h-3 md:w-4 md:h-4' />
              Tên khóa
            </div>
            <div>Thể loại</div>
            <div className='hidden md:block'>Trạng thái</div>
            <div className='hidden md:block'>Mức hoàn thành</div>
            <div></div>
          </div>

          {/* Course rows */}
          {courses.map((course, index) => (
            <div
              key={index}
              className='grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 py-2 md:py-3 items-center rounded-lg bg-white hover:bg-dashboard-primary/10 transition-all border border-dashboard-primary/10 shadow-sm'
            >
              <div className='flex items-center gap-1 md:gap-2'>
                <span className='ml-1 md:ml-3 text-xs md:text-base font-semibold text-dashboard-primary'>
                  {course.name}
                </span>
              </div>
              <div className='text-xs md:text-base text-dashboard-primary'>{course.type}</div>
              <div className='hidden md:block'>
                <Badge className='bg-dashboard-second/80 text-dashboard-primary px-2 md:px-3 py-1 rounded-xl shadow'>
                  {course.status}
                </Badge>
              </div>
              <div className='hidden md:flex items-center gap-2 md:gap-3'>
                <Progress value={course.progress} className='flex-1 h-1 md:h-2 bg-dashboard-primary/20' />
                <span className='text-xs md:text-sm font-medium min-w-[24px] md:min-w-[32px] text-dashboard-primary'>
                  {course.progress}%
                </span>
              </div>
              <div></div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseTable
