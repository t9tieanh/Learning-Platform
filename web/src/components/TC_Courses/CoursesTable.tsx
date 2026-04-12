import { FC } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Filter, Check, BookOpen, Clock, Calendar, Rocket, Plus } from 'lucide-react'
import { Course, CourseStatus } from './CourseTypes'
import { useNavigate } from 'react-router-dom'
import courseService from '@/services/course/course.service'
import { toast } from 'sonner'
import { showConfirmToast } from '../common/ShowConfirmToast'
import noPhoto from '@/assets/images/no-photo.avif'

const getStatusBadge = (status: CourseStatus) => {
  switch (status) {
    case 'active':
    case 'PUBLISHED':
      return (
        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-100 shadow-sm'>
          <div className='w-1 h-1 rounded-full bg-blue-500 animate-pulse' />
          <span className='text-[10px] font-bold uppercase tracking-wider'>Hoạt động</span>
        </div>
      )
    case 'pending':
    case 'PENDING_REVIEW':
      return (
        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100 shadow-sm'>
          <div className='w-1 h-1 rounded-full bg-amber-500' />
          <span className='text-[10px] font-bold uppercase tracking-wider'>Chờ duyệt</span>
        </div>
      )
    default:
      return (
        <div className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-50 text-gray-500 border border-gray-100 shadow-sm'>
          <div className='w-1 h-1 rounded-full bg-gray-400' />
          <span className='text-[10px] font-bold uppercase tracking-wider'>Bản nháp</span>
        </div>
      )
  }
}

interface CoursesTableProps {
  courses: Course[]
  statusFilter?: '' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW'
  onChangeStatusFilter?: (status: '' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW') => void
  fetchCourses: (nextPage?: number) => Promise<void>
}

const statusOptions: Array<'' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW'> = ['', 'PUBLISHED', 'DRAFT', 'PENDING_REVIEW']

const EmptyState: FC = () => {
  return (
    <div className='flex flex-col items-center justify-center py-24 px-6 bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm'>
      <div className='w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center mb-6 relative group'>
        <div className='absolute inset-0 bg-blue-100 rounded-[2.5rem] scale-90 blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500' />
        <BookOpen className='w-10 h-10 text-blue-500 relative z-10 transition-transform duration-500 group-hover:scale-110' />
        <Rocket className='w-5 h-5 text-blue-400 absolute top-0 right-0 animate-bounce' />
      </div>
      <h3 className='text-xl font-black text-gray-900 mb-2 tracking-tight uppercase'>Chưa có khóa học nào</h3>
      <p className='text-gray-400 text-sm font-medium max-w-sm text-center mb-8 leading-relaxed'>
        Hãy bắt đầu hành trình giảng dạy của bạn bằng cách xây dựng bài giảng đầu tiên trên hệ thống.
      </p>
      <button
        onClick={() => window.location.search = '?openCreate=true'}
        className='inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-[13px] hover:bg-black transition-all shadow-xl shadow-blue-100 active:scale-[0.98]'
      >
        <Plus className='w-4 h-4' />
        Tạo khóa học ngay
      </button>
    </div>
  )
}

const CoursesTable: FC<CoursesTableProps> = ({ courses, statusFilter = '', onChangeStatusFilter, fetchCourses }) => {
  const navigate = useNavigate()

  const handleDelete = async (courseId: string) => {
    const confirmed = await showConfirmToast({
      title: 'Bạn có chắc chắn muốn xóa khóa học này?',
      confirmLabel: 'Xóa',
      cancelLabel: 'Hủy'
    })
    if (confirmed) {
      const response = await courseService.delCourse(courseId)
      if (response && response.code === 200 && response.message) {
        toast.success(response.message)
        await fetchCourses()
      } else {
        toast.error(response.message || 'Xóa khóa học thất bại')
      }
    }
  }

  if (courses.length === 0) return <EmptyState />

  return (
    <div className='relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white shadow-xl shadow-gray-200/50'>
      <Table className='min-w-[800px]'>
        <TableHeader>
          <TableRow className='bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100'>
            <TableHead className='px-8 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]'>Thông tin khóa học</TableHead>
            <TableHead className='px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]'>
              <div className='flex items-center gap-2'>
                <span>Trạng thái</span>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className={`p-1 rounded-lg border transition-all ${statusFilter ? 'border-blue-200 text-blue-600 bg-blue-50' : 'border-gray-200 text-gray-400'
                        } hover:border-blue-300 hover:text-blue-500`}
                    >
                      <Filter className='w-3.5 h-3.5' />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='start' className='rounded-2xl shadow-2xl border border-gray-100 p-1'>
                    {statusOptions.map((opt) => (
                      <DropdownMenuItem
                        key={opt || 'ALL'}
                        className='rounded-xl px-4 py-2 text-[12px] font-bold flex items-center justify-between cursor-pointer focus:bg-blue-50 focus:text-blue-600'
                        onClick={() => onChangeStatusFilter?.(opt)}
                      >
                        {opt === '' ? 'Tất cả trạng thái' : opt}
                        {statusFilter === opt && <Check className='w-4 h-4 text-blue-600' />}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </TableHead>
            <TableHead className='px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]'>Thời lượng</TableHead>
            <TableHead className='px-6 py-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]'>Ngày tạo</TableHead>
            <TableHead className='px-8 py-6' />
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses.map((course) => (
            <TableRow
              key={course.id}
              className='group hover:bg-blue-50/30 transition-all cursor-pointer border-b border-gray-50 last:border-0'
              onClick={() => navigate(`/teacher/course-details/${course.id}`)}
            >
              <TableCell className='px-8 py-5'>
                <div className='flex items-center gap-5'>
                  <div className='relative shrink-0 group/img'>
                    <img
                      src={course.thumbnailUrl || course.image || noPhoto}
                      alt={course.title}
                      className='w-24 h-16 rounded-[1.25rem] object-cover shadow-md transition-transform duration-500 group-hover/img:scale-105 group-hover:shadow-blue-200/50'
                    />
                    <div className='absolute inset-0 rounded-[1.25rem] border border-black/5 group-hover:border-blue-500/20 transition-all' />
                  </div>
                  <div className='space-y-1.5'>
                    <h4 className='font-black text-gray-900 text-[15px] tracking-tight group-hover:text-blue-600 transition-colors truncate max-w-[280px]'>
                      {course.title}
                    </h4>
                    <div className='flex items-center gap-3'>
                      <div className='flex flex-wrap gap-1.5'>
                        {(course.tagNames || course.tags || []).slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className='px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-700 transition-colors'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className='px-6 py-5'>{getStatusBadge(course.status)}</TableCell>
              <TableCell className='px-6 py-5'>
                <div className='flex items-center gap-2 text-gray-400 group-hover:text-blue-600 transition-colors'>
                  <Clock className='w-3.5 h-3.5' />
                  <span className='text-[12px] font-bold'>{course.duration || '0 phút'}</span>
                </div>
              </TableCell>
              <TableCell className='px-6 py-5'>
                <div className='flex items-center gap-2 text-gray-400'>
                  <Calendar className='w-3.5 h-3.5' />
                  <span className='text-[12px] font-bold italic opacity-60'>{course.createdAt || 'N/A'}</span>
                </div>
              </TableCell>
              <TableCell className='px-8 py-5 text-right'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='w-10 h-10 rounded-xl transition-all hover:bg-white hover:shadow-xl hover:text-blue-600'
                    >
                      <MoreHorizontal className='w-5 h-5' />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end' className='rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[160px]'>
                    <DropdownMenuItem
                      className='rounded-xl px-4 py-2.5 text-[12px] font-bold cursor-pointer transition-all focus:bg-blue-600 focus:text-white'
                      onClick={() => navigate(`/teacher/course-details/${course.id}`)}
                    >
                      Chi tiết khóa học
                    </DropdownMenuItem>
                    <DropdownMenuItem className='rounded-xl px-4 py-2.5 text-[12px] font-bold cursor-pointer transition-all focus:bg-blue-600 focus:text-white'>
                      Thống kê doanh thu
                    </DropdownMenuItem>
                    <div className='h-px bg-gray-100 my-1 mx-2' />
                    <DropdownMenuItem
                      className='rounded-xl px-4 py-2.5 text-[12px] font-bold text-red-600 cursor-pointer transition-all focus:bg-red-600 focus:text-white'
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(course.id)
                      }}
                    >
                      Xóa khóa học
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
