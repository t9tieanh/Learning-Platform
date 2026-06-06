import { FC } from 'react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { MoreHorizontal, Filter, Check, BookOpen, Calendar, Plus } from 'lucide-react'
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
        <div className='inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1'>
          <div className='h-1.5 w-1.5 rounded-full bg-cyan-500' />
          <span className='text-[10px] font-semibold tracking-wide text-cyan-700'>Hoạt động</span>
        </div>
      )
    case 'pending':
    case 'PENDING_REVIEW':
      return (
        <div className='inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1'>
          <div className='h-1.5 w-1.5 rounded-full bg-amber-500' />
          <span className='text-[10px] font-semibold tracking-wide text-amber-700'>Chờ duyệt</span>
        </div>
      )
    default:
      return (
        <div className='inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1'>
          <div className='h-1.5 w-1.5 rounded-full bg-slate-500' />
          <span className='text-[10px] font-semibold tracking-wide text-slate-600'>Bản nháp</span>
        </div>
      )
  }
}

interface CoursesTableProps {
  courses: Course[]
  statusFilter?: '' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW'
  onChangeStatusFilter?: (status: '' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW') => void
  fetchCourses: (nextPage?: number) => Promise<void>
  onRequestCreate?: () => void
}

const statusOptions: Array<'' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW'> = ['', 'PUBLISHED', 'DRAFT', 'PENDING_REVIEW']

const statusFilterLabels: Record<'' | 'PUBLISHED' | 'DRAFT' | 'PENDING_REVIEW', string> = {
  '': 'Tất cả trạng thái',
  PUBLISHED: 'Hoạt động',
  DRAFT: 'Bản nháp',
  PENDING_REVIEW: 'Chờ duyệt'
}

const EmptyState: FC<{ onRequestCreate?: () => void }> = ({ onRequestCreate }) => {
  return (
    <div className='rounded-[1.75rem] border border-slate-200/80 bg-white/95 px-6 py-20 shadow-[0_16px_40px_rgba(15,23,42,0.08)]'>
      <div className='mx-auto flex max-w-md flex-col items-center text-center'>
        <div className='mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-blue-100 text-blue-700'>
          <BookOpen className='h-8 w-8' />
        </div>

        <h3 className='text-xl font-semibold tracking-tight text-slate-900'>Chưa có khóa học nào</h3>
        <p className='mt-2 text-sm leading-relaxed text-slate-500'>
          Hãy bắt đầu hành trình giảng dạy bằng cách tạo khóa học đầu tiên của bạn trên hệ thống.
        </p>

        <button
          type='button'
          onClick={() => onRequestCreate?.()}
          className='mt-7 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_25px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:bg-blue-700 active:scale-[0.98]'
        >
          <Plus className='h-4 w-4' />
          Tạo khóa học ngay
        </button>
      </div>
    </div>
  )
}

const CoursesTable: FC<CoursesTableProps> = ({
  courses,
  statusFilter = '',
  onChangeStatusFilter,
  fetchCourses,
  onRequestCreate
}) => {
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

  if (courses.length === 0 && !statusFilter) return <EmptyState onRequestCreate={onRequestCreate} />

  return (
    <div className='h-[720px] overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.05)]'>
      <div className='h-full overflow-auto'>
        <Table className='min-w-[860px] table-fixed'>
          <colgroup>
            <col className='w-[48%]' />
            <col className='w-[20%]' />
            <col className='w-[18%]' />
            <col className='w-[14%]' />
          </colgroup>
          <TableHeader>
            <TableRow className='border-b border-blue-100/80 bg-gradient-to-r from-cyan-50 via-blue-50/80 to-indigo-50/85 hover:from-cyan-50 hover:via-blue-50/80 hover:to-indigo-50/85'>
              <TableHead className='px-7 py-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700'>
                Thông tin khóa học
              </TableHead>
              <TableHead className='px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700'>
                <div className='flex items-center gap-2'>
                  <span>Trạng thái</span>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={`rounded-lg border p-1.5 transition-all ${
                          statusFilter
                            ? 'border-blue-300 bg-blue-100 text-blue-700'
                            : 'border-blue-200/80 bg-white/90 text-blue-500'
                        } hover:border-blue-300 hover:text-blue-600`}
                      >
                        <Filter className='h-3.5 w-3.5' />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='start' className='rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg'>
                      {statusOptions.map((opt) => (
                        <DropdownMenuItem
                          key={opt || 'ALL'}
                          className='flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-slate-700 focus:bg-blue-50 focus:text-blue-700'
                          onClick={() => onChangeStatusFilter?.(opt)}
                        >
                          {statusFilterLabels[opt]}
                          {statusFilter === opt && <Check className='h-4 w-4 text-blue-600' />}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead className='px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700'>Ngày tạo</TableHead>
              <TableHead className='px-7 py-5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-blue-700'>
                Thao tác
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {courses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className='px-6 py-16 text-center'>
                  <h3 className='text-xl font-semibold tracking-tight text-slate-900'>Chưa có khóa học nào</h3>
                  <p className='mt-2 text-sm leading-relaxed text-slate-500'>
                    Hãy bắt đầu hành trình giảng dạy bằng cách tạo khóa học đầu tiên của bạn trên hệ thống.
                  </p>
                </TableCell>
              </TableRow>
            ) : (
              courses.map((course) => (
                <TableRow
                  key={course.id}
                  className='group cursor-pointer border-b border-slate-100 transition-colors hover:bg-blue-50/35 last:border-0'
                  onClick={() => navigate(`/teacher/course-details/${course.id}`)}
                >
                  <TableCell className='px-7 py-4'>
                    <div className='flex items-center gap-4'>
                      <div className='relative shrink-0 overflow-hidden rounded-xl border border-slate-200'>
                        <img
                          src={course.thumbnailUrl || course.image || noPhoto}
                          alt={course.title}
                          className='h-16 w-24 object-cover transition-transform duration-500 group-hover:scale-105'
                        />
                      </div>

                      <div className='min-w-0'>
                        <h4 className='truncate text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-700'>
                          {course.title}
                        </h4>
                        {course.shortDescription && (
                          <p className='mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500'>
                            {course.shortDescription}
                          </p>
                        )}
                        <div className='mt-1.5 flex flex-wrap gap-1.5'>
                          {(course.tagNames || course.tags || []).slice(0, 2).map((tag, idx) => (
                            <span
                              key={idx}
                              className='rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 transition-colors group-hover:border-blue-200 group-hover:bg-blue-50 group-hover:text-blue-700'
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className='px-6 py-4'>{getStatusBadge(course.status)}</TableCell>

                  <TableCell className='px-6 py-4'>
                    <div className='flex items-center gap-2 text-slate-500'>
                      <Calendar className='h-3.5 w-3.5' />
                      <span className='text-xs font-medium'>{course.createdAt || 'N/A'}</span>
                    </div>
                  </TableCell>

                  <TableCell className='px-7 py-4 text-right'>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-9 w-9 rounded-xl text-slate-500 transition-all hover:bg-white hover:text-blue-600 hover:shadow-md'
                        >
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end' className='min-w-[175px] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg'>
                        <DropdownMenuItem
                          className='cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-slate-700 transition-colors focus:bg-blue-50 focus:text-blue-700'
                          onClick={() => navigate(`/teacher/course-details/${course.id}`)}
                        >
                          Chi tiết khóa học
                        </DropdownMenuItem>
                        <div className='my-1 h-px bg-slate-100' />
                        <DropdownMenuItem
                          className='cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-rose-600 transition-colors focus:bg-rose-50 focus:text-rose-700'
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default CoursesTable
