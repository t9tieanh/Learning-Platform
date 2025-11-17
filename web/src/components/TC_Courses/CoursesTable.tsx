import { FC } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Filter, Check } from 'lucide-react'
import { Course, CourseStatus } from './CourseTypes'
import { useNavigate } from 'react-router-dom'

const getStatusBadge = (status: CourseStatus) => {
  switch (status) {
    case 'active':
    case 'PUBLISHED':
      return (
        <Badge className='bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-200 px-3 py-1.5 text-xs rounded-full'>
          Hoạt động
        </Badge>
      )
    case 'pending':
    case 'PENDING_REVIEW':
      return (
        <Badge className='bg-yellow-100 text-yellow-700 dark:bg-yellow-800 dark:text-yellow-200 px-3 py-1.5 text-xs rounded-full'>
          Chờ duyệt
        </Badge>
      )
    case 'closed':
    case 'DRAFT':
      return (
        <Badge className='bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-200 px-3 py-1.5 text-xs rounded-full'>
          Bản nháp
        </Badge>
      )
  }
}

interface CoursesTableProps {
  courses: Course[]
  statusFilter?: '' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW'
  onChangeStatusFilter?: (status: '' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW') => void
}

const statusOptions: Array<'' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW'> = ['', 'PUBLISHED', 'DRAFT', 'PENDING_REVIEW']

const CoursesTable: FC<CoursesTableProps> = ({ courses, statusFilter = '', onChangeStatusFilter }) => {
  const navigate = useNavigate()

  return (
    <div className='overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm'>
      <Table className='min-w-[700px]'>
        <TableHeader>
          <TableRow className='bg-blue-100 dark:bg-slate-800'>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Khóa học</TableHead>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>
              <div className='flex items-center gap-2'>
                <span>Trạng thái</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`p-1 rounded-md border transition-colors ${statusFilter ? 'border-blue-300 text-blue-600 bg-white' : 'border-transparent text-blue-600'
                        } hover:bg-blue-50`}
                      aria-label='Lọc theo trạng thái'
                    >
                      <Filter className='w-4 h-4' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='rounded-xl shadow-lg border border-gray-100'>
                    {statusOptions.map((opt) => (
                      <DropdownMenuItem
                        key={opt || 'ALL'}
                        className='rounded-md px-3 py-2 text-sm flex items-center justify-between'
                        onClick={() => onChangeStatusFilter?.(opt)}
                      >
                        {opt === '' ? 'Tất cả' : opt}
                        {statusFilter === opt && <Check className='w-4 h-4 text-blue-600' />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableHead>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Học viên</TableHead>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Thời lượng</TableHead>
            <TableHead className='p-3 sm:p-6 text-blue-600 dark:text-gray-300'>Ngày tạo</TableHead>
            <TableHead />
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow
              key={course.id}
              className='hover:bg-white dark:hover:bg-slate-800 hover:shadow-md transition-all cursor-pointer'
              onClick={() => navigate(`/teacher/course-details/${course.id}`)}
            >
              <TableCell className='p-3 sm:p-4 flex items-center gap-3 sm:gap-4'>
                <img
                  src={
                    course.thumbnailUrl ||
                    course.image ||
                    'https://img.freepik.com/premium-vector/no-photo-available-vector-icon-default-image-symbol-picture-coming-soon-web-site-mobile-app_87543-18055.jpg'
                  }
                  alt={course.title}
                  className='w-20 h-14 sm:w-28 sm:h-20 rounded-lg object-cover shadow-sm'
                />
                <div>
                  <div className='font-semibold text-gray-700 dark:text-gray-100 text-base sm:text-lg'>
                    {course.title}
                    <p className='text-sm text-gray-400 dark:text-gray-500 font-light'>{course?.shortDescription}</p>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-2'>
                    {(course.tagNames || course.tags || []).map((tag, idx) => (
                      <span
                        key={idx}
                        className='px-2 py-0.5 text-[10px] sm:text-xs rounded-full bg-indigo-50 text-blue-700 dark:bg-slate-700 dark:text-indigo-300 shadow-sm'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </TableCell>
              <TableCell className='px-4'>{getStatusBadge(course.status)}</TableCell>
              <TableCell className='text-gray-700 dark:text-gray-300 px-10'>{course.students ?? 0}</TableCell>
              <TableCell className='text-gray-700 dark:text-gray-300'>{course.duration ?? '-'}</TableCell>
              <TableCell className='text-gray-500 dark:text-gray-400 text-xs sm:text-sm px-5'>
                {course.createdAt ?? ''}
              </TableCell>
              <TableCell className='text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-full transition-all hover:bg-blue-50 hover:text-blue-600 focus-visible:ring-2 focus-visible:ring-blue-200'
                    >
                      <MoreHorizontal className='w-5 h-5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='rounded-xl shadow-lg border border-gray-100'>
                    <DropdownMenuItem className='rounded-md px-3 py-2 text-sm transition-colors data-[highlighted]:bg-blue-500 data-[highlighted]:text-white'>
                      Xem chi tiết
                    </DropdownMenuItem>
                    <DropdownMenuItem className='rounded-md px-3 py-2 text-sm transition-colors data-[highlighted]:bg-blue-500 data-[highlighted]:text-white'>
                      Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem className='rounded-md px-3 py-2 text-sm text-red-600 transition-colors data-[highlighted]:bg-red-500 data-[highlighted]:text-white'>
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default CoursesTable
