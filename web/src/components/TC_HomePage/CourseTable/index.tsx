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
        <CardTitle className='flex items-center gap-2'>
          <BookOpen className='text-dashboard-primary' size={22} />
          Khóa học của bạn
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className='space-y-3'>
          {/* Headers */}
          <div className='grid grid-cols-5 gap-4 py-2 text-sm font-semibold text-dashboard-primary border-b border-dashboard-primary/10 bg-dashboard-primary/5 rounded-lg'>
            <div className='flex items-center gap-1'>
              <Layers size={16} className='text-dashboard-primary' />
              Tên khóa
            </div>
            <div>Thể loại</div>
            <div>Trạng thái</div>
            <div>Mức hoàn thành</div>
            <div></div>
          </div>

          {/* Course rows */}
          {courses.map((course, index) => (
            <div
              key={index}
              className='grid grid-cols-5 gap-4 py-3 items-center rounded-lg bg-white hover:bg-dashboard-primary/10 transition-all border border-dashboard-primary/10 shadow-sm'
            >
              <div className='flex items-center gap-2'>
                <span className='ml-3 text-base font-semibold text-dashboard-primary'>{course.name}</span>
              </div>
              <div className='text-base text-dashboard-primary'>{course.type}</div>
              <div>
                <Badge className='bg-dashboard-second/80 text-dashboard-primary px-3 py-1 rounded-xl shadow'>
                  {course.status}
                </Badge>
              </div>
              <div className='flex items-center gap-3'>
                <Progress value={course.progress} className='flex-1 h-2 bg-dashboard-primary/20' />
                <span className='text-sm font-medium min-w-[32px] text-dashboard-primary'>{course.progress}%</span>
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
