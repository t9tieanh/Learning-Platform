import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Layers, Activity } from 'lucide-react'

const courses = [
  { name: 'NodeJS', type: 'Backend', status: 'Hoạt động', progress: 70 },
  { name: 'ReactJS', type: 'Frontend', status: 'Hoạt động', progress: 85 },
  { name: 'DevOps', type: 'Cloud', status: 'Tạm dừng', progress: 40 },
  { name: 'Python ML', type: 'AI', status: 'Chờ xử lý', progress: 100 },
  { name: 'UI/UX Design', type: 'Design', status: 'Hoạt động', progress: 55 }
]

// helper màu trạng thái
const getStatusColor = (status: string) => {
  switch (status) {
    case 'Hoạt động':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    case 'Tạm dừng':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    case 'Chờ xử lý':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    default:
      return 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
  }
}

const CourseTable = () => {
  return (
    <Card className='shadow-xl border-0 rounded-2xl overflow-hidden mb-4'>
      <CardHeader className='bg-gradient-to-r from-primary to-indigo-500 text-white rounded-lg mt-0'>
        <CardTitle className='flex items-center gap-2 text-lg md:text-xl font-bold py-2'>
          <BookOpen size={22} className='mt-2' />
          <p className='text-lg opacity-90 mt-1'>Quản lý và theo dõi tiến độ học tập</p>
        </CardTitle>
      </CardHeader>

      <CardContent className='p-4 md:p-6'>
        <div className='space-y-2 md:space-y-3'>
          {/* Headers */}
          <div className='grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 py-2 text-xs md:text-sm font-semibold text-zinc-600 dark:text-zinc-300 border-b border-zinc-200 dark:border-zinc-700'>
            <div className='pl-3'>Tên khóa</div>
            <div>Thể loại</div>
            <div className='hidden md:block'>Trạng thái</div>
            <div className='hidden md:block'>Hoàn thành</div>
            <div></div>
          </div>

          {/* Rows */}
          {courses.map((course, index) => (
            <div
              key={index}
              className='grid grid-cols-2 md:grid-cols-5 gap-2 md:gap-4 py-3 items-center rounded-lg bg-white dark:bg-zinc-900 hover:shadow-md hover:scale-[1.01] transition-all duration-300 border border-zinc-100 dark:border-zinc-800'
            >
              {/* Tên khóa */}
              <div className='flex items-center gap-2 pl-3'>
                <Layers className='text-primary' size={18} />
                <span className='font-semibold text-primary text-base'>{course.name}</span>
              </div>

              {/* Loại */}
              <div>
                <Badge variant='outline' className='text-xs px-2 py-0.5 rounded-md text-zinc-600 dark:text-zinc-300'>
                  {course.type}
                </Badge>
              </div>

              {/* Trạng thái */}
              <div className='hidden md:block'>
                <Badge className={`${getStatusColor(course.status)} px-2 md:px-3 py-1 rounded-lg`}>
                  {course.status}
                </Badge>
              </div>

              {/* Progress */}
              <div className='hidden md:flex items-center gap-3'>
                <div className='flex-1 h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden'>
                  <div
                    className='h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full'
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <span className='text-xs md:text-sm font-medium text-zinc-600 dark:text-zinc-300'>
                  {course.progress}%
                </span>
              </div>

              <div className='flex justify-end pr-3'>
                <Activity className='text-zinc-400 hover:text-primary cursor-pointer' size={18} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default CourseTable
